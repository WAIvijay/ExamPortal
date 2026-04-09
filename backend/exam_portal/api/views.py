import base64
import os
import json
import re
import numpy as np
from collections import Counter
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Student
from .serializers import StudentSerializer

try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
except Exception:
    pass

MIN_FILLED_BUBBLES = 5

# Exact bubble X positions calculated from omr_sheet_boo.html
# body=794px, padding=20px, 3 col groups, each bubble=20px, opt-label=8px, gap=6px
BUBBLE_X_FRACS = [
    [0.0756, 0.1184, 0.1612, 0.2040],  # Group 1: Q1-Q10
    [0.3934, 0.4362, 0.4790, 0.5218],  # Group 2: Q11-Q20
    [0.7112, 0.7540, 0.7968, 0.8396],  # Group 3: Q21-Q30
]


@api_view(['GET'])
def get_students(request):
    students = Student.objects.all().order_by('-score')
    serializer = StudentSerializer(students, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def add_student(request):
    phone = request.data.get('phone', '').strip()
    if not phone.isdigit():
        return Response({'error': 'Phone number must contain digits only.'}, status=400)
    if len(phone) != 10:
        return Response({'error': 'Phone number must be exactly 10 digits.'}, status=400)
    if Student.objects.filter(phone=phone).exists():
        return Response({'error': f'A student with phone number {phone} already exists.'}, status=400)
    serializer = StudentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['POST'])
def scan_omr(request):
    import cv2

    image_b64 = request.data.get('image_base64', '')
    media_type = request.data.get('media_type', 'image/jpeg')

    if not image_b64:
        return Response({'error': 'No image provided'}, status=400)

    gemini_key = os.environ.get('GEMINI_API_KEY', '')
    if not gemini_key:
        return Response({'error': 'Gemini API key not configured.'}, status=500)

    try:
        # Decode image
        img_bytes = base64.b64decode(image_b64)
        np_arr   = np.frombuffer(img_bytes, np.uint8)
        img      = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if img is None:
            return Response({'error': 'Could not decode image'}, status=400)

        # Step 1: OpenCV bubble detection (fast, no API call)
        warped     = _warp_sheet(img)
        cv_answers = _opencv_bubbles(warped)
        cv_filled  = sum(1 for a in cv_answers if a is not None)

        # Step 2: Single Gemini call — extract details + verify answers together
        name, phone, school, version, final_answers = _gemini_single_call(
            image_b64, media_type, gemini_key, cv_answers
        )

        filled = sum(1 for a in final_answers if a is not None)

        if filled < MIN_FILLED_BUBBLES:
            return Response({
                'error': f'Sheet appears blank — only {filled} bubble(s) detected.'
            }, status=400)

        return Response({
            'name':       name,
            'school':     school,
            'phone':      phone,
            'version':    version,
            'answers':    final_answers,
            'confidence': f'{filled}/30 bubbles detected',
            'warning': 'Gemini rate limited — name/phone/school could not be extracted. Fill manually.' if not name or not phone or not school else None,
        })

    except Exception as e:
        return Response({'error': str(e)}, status=500)


def _gemini_single_call(image_b64, media_type, key, cv_answers):
    """Single Gemini call: extract student info only. Answers come from OpenCV."""
    import urllib.request, urllib.error, time

    try:
        from dotenv import load_dotenv
        load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'), override=True)
    except Exception:
        pass
    active_key = os.environ.get('GEMINI_API_KEY', '') or key
    print(f"[GEMINI] Using key: {active_key[:20]}...")

    prompt = (
        "This is a student OMR answer sheet image. "
        "Look at the text fields at the TOP of the sheet and extract:\n"
        "1. name: student full name\n"
        "2. phone: 10-digit mobile number (digits only)\n"
        "3. school: school or college name\n"
        "4. version: which bubble is filled in Version row (A, B, C, or D)\n\n"
        "Return ONLY a raw JSON object. No markdown. No code blocks. No explanation.\n"
        "Example: {\"name\":\"Ravi Kumar\",\"phone\":\"9876543210\",\"school\":\"ABC School\",\"version\":\"A\"}"
    )

    payload = json.dumps({
        "contents": [{"parts": [
            {"text": prompt},
            {"inline_data": {"mime_type": media_type, "data": image_b64}}
        ]}],
        "generationConfig": {"temperature": 0, "maxOutputTokens": 512}
    }).encode()

    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-2.5-flash:generateContent?key={active_key}"
    )

    for attempt in range(2):
        req = urllib.request.Request(
            url, data=payload,
            headers={"Content-Type": "application/json"}, method="POST"
        )
        try:
            with urllib.request.urlopen(req, timeout=20) as r:
                resp_data = json.loads(r.read().decode())

            raw = resp_data['candidates'][0]['content']['parts'][0]['text'].strip()
            print(f"[GEMINI] Raw response: {raw[:200]}")

            # Strip markdown code fences if present
            if raw.startswith("```"):
                lines = raw.split("\n")
                raw = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
            raw = raw.strip()

            # Extract JSON object from response
            start = raw.find("{")
            end   = raw.rfind("}") + 1
            if start >= 0 and end > start:
                raw = raw[start:end]

            parsed = json.loads(raw)
            name   = str(parsed.get('name', '')).strip()
            phone  = re.sub(r'\D', '', str(parsed.get('phone', '')))
            school = str(parsed.get('school', '')).strip()
            ver    = str(parsed.get('version', 'A')).upper()
            if ver not in ('A', 'B', 'C', 'D'):
                ver = 'A'

            print(f"[GEMINI] Parsed: name={name}, phone={phone}, school={school}, ver={ver}")
            return name, phone, school, ver, cv_answers

        except urllib.error.HTTPError as e:
            err_body = e.read().decode()[:200]
            print(f"[GEMINI] HTTP {e.code}: {err_body}")
            if e.code == 429 and attempt == 0:
                time.sleep(4)
                continue
            break
        except Exception as e:
            print(f"[GEMINI] Exception: {type(e).__name__}: {e}")
            break

    return '', '', '', 'A', cv_answers


def _warp_sheet(img):
    import cv2
    OUT_W, OUT_H = 794, 1123
    h, w = img.shape[:2]
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 50, 255, cv2.THRESH_BINARY_INV)
    cnts, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    markers = []
    for cnt in cnts:
        area = cv2.contourArea(cnt)
        if area < h * w * 0.00008 or area > h * w * 0.004:
            continue
        x, y, bw, bh = cv2.boundingRect(cnt)
        if bw == 0 or bh == 0:
            continue
        if not (0.4 < bw / bh < 2.5):
            continue
        markers.append((x + bw // 2, y + bh // 2))

    if len(markers) >= 4:
        markers.sort(key=lambda p: p[1])
        top    = sorted(markers[:2],  key=lambda p: p[0])
        bottom = sorted(markers[-2:], key=lambda p: p[0])
        src = np.float32([top[0], top[1], bottom[0], bottom[1]])
        dst = np.float32([[0,0],[OUT_W,0],[0,OUT_H],[OUT_W,OUT_H]])
        M   = cv2.getPerspectiveTransform(src, dst)
        return cv2.warpPerspective(img, M, (OUT_W, OUT_H))

    return cv2.resize(img, (OUT_W, OUT_H))


def _opencv_bubbles(img):
    import cv2
    OUT_W, OUT_H = 794, 1123
    opts = ['A', 'B', 'C', 'D']

    gray    = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    h, w = img.shape[:2]

    # Grid Y positions — answer section starts ~38.5% from top, ends ~96%
    grid_top    = int(h * 0.385)
    grid_bottom = int(h * 0.960)
    row_h       = (grid_bottom - grid_top) / 10
    bubble_r    = max(int(row_h * 0.30), 6)

    # Lower threshold — detect even lightly filled bubbles
    THRESHOLD = 0.18

    answers = []
    for grp in range(3):
        for row in range(10):
            cy = int(grid_top + row_h * row + row_h / 2)
            best_ratio = -1
            best_opt   = None

            for bi, opt in enumerate(opts):
                cx = int(w * BUBBLE_X_FRACS[grp][bi])
                mask   = np.zeros(thresh.shape, dtype=np.uint8)
                cv2.circle(mask, (cx, cy), bubble_r, 255, -1)
                total  = cv2.countNonZero(mask)
                filled = cv2.countNonZero(cv2.bitwise_and(thresh, thresh, mask=mask))
                ratio  = filled / total if total > 0 else 0
                if ratio > best_ratio:
                    best_ratio = ratio
                    best_opt   = opt

            answers.append(best_opt if best_ratio >= THRESHOLD else None)

    return answers


@api_view(['POST'])
def scan_bulk(request):
    pdf_b64 = request.data.get('pdf_base64', '')
    if not pdf_b64:
        return Response({'error': 'No PDF provided'}, status=400)

    gemini_key = os.environ.get('GEMINI_API_KEY', '')
    if not gemini_key:
        return Response({'error': 'Gemini API key not configured.'}, status=500)

    try:
        from pdf2image import convert_from_bytes
        import io, cv2

        pdf_bytes = base64.b64decode(pdf_b64)
        poppler_path = os.environ.get('POPPLER_PATH', None)
        try:
            pages = convert_from_bytes(pdf_bytes, dpi=150, poppler_path=poppler_path)
        except Exception as e:
            return Response({'error': f'PDF conversion failed: {str(e)}'}, status=400)

        results = []
        for page_num, pil_img in enumerate(pages, start=1):
            buf = io.BytesIO()
            pil_img.save(buf, format='JPEG', quality=90)
            img_b64 = base64.b64encode(buf.getvalue()).decode()

            try:
                img_bytes = buf.getvalue()
                np_arr = np.frombuffer(img_bytes, np.uint8)
                img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

                warped     = _warp_sheet(img)
                cv_answers = _opencv_bubbles(warped)
                name, phone, school, version, answers = _gemini_single_call(
                    img_b64, 'image/jpeg', gemini_key, cv_answers
                )
                filled = sum(1 for a in answers if a is not None)
                if filled < MIN_FILLED_BUBBLES:
                    results.append({'page': page_num, 'status': 'error',
                                    'error': f'Blank sheet — {filled} bubbles'})
                    continue

                if not phone or not phone.isdigit() or len(phone) != 10:
                    results.append({'page': page_num, 'status': 'error',
                                    'name': name,
                                    'error': f'Invalid phone "{phone}" — add manually'})
                    continue

                if Student.objects.filter(phone=phone).exists():
                    results.append({'page': page_num, 'status': 'skipped',
                                    'name': name, 'error': f'Phone {phone} already exists'})
                    continue

                body = {'name': name or f'Student {page_num}', 'school': school,
                        'phone': phone, 'version': version, 'answers': answers,
                        'score': 0, 'rank': 0}
                serializer = StudentSerializer(data=body)
                if serializer.is_valid():
                    serializer.save()
                    results.append({'page': page_num, 'status': 'saved',
                                    'name': name, 'phone': phone,
                                    'version': version, 'filled': filled})
                else:
                    results.append({'page': page_num, 'status': 'error',
                                    'error': str(serializer.errors)})
            except Exception as e:
                results.append({'page': page_num, 'status': 'error', 'error': str(e)})

        saved   = sum(1 for r in results if r['status'] == 'saved')
        skipped = sum(1 for r in results if r['status'] == 'skipped')
        errors  = sum(1 for r in results if r['status'] == 'error')

        return Response({'total': len(pages), 'saved': saved,
                         'skipped': skipped, 'errors': errors, 'results': results})

    except Exception as e:
        return Response({'error': str(e)}, status=500)

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group, Permission
from django.contrib.contenttypes.models import ContentType
from api.models import Student

class Command(BaseCommand):
    help = 'Setup all users, groups, and sample data for the project'

    def handle(self, *args, **kwargs):
        self.stdout.write('Setting up project...')

        # ── 1. Create Groups ─────────────────────────────────────────────────
        student_ct = ContentType.objects.get_for_model(Student)
        all_perms = Permission.objects.filter(content_type=student_ct)

        # Admin group — full access
        admin_group, _ = Group.objects.get_or_create(name='Admin')
        admin_group.permissions.set(all_perms)
        self.stdout.write('  [OK] Group: Admin (full access)')

        # Staff group — add/change students only
        staff_group, _ = Group.objects.get_or_create(name='Staff')
        staff_perms = Permission.objects.filter(
            content_type=student_ct,
            codename__in=['add_student', 'change_student', 'view_student']
        )
        staff_group.permissions.set(staff_perms)
        self.stdout.write('  [OK] Group: Staff (add/change/view students)')

        # Principal group — view only
        principal_group, _ = Group.objects.get_or_create(name='Principal')
        principal_perms = Permission.objects.filter(
            content_type=student_ct,
            codename='view_student'
        )
        principal_group.permissions.set(principal_perms)
        self.stdout.write('  [OK] Group: Principal (view students only)')

        # ── 2. Create Users ──────────────────────────────────────────────────
        # Superadmin
        if not User.objects.filter(username='admin').exists():
            u = User.objects.create_superuser('admin', 'admin@exam.com', 'admin123')
            self.stdout.write('  [OK] User: admin / admin123 (superuser)')
        else:
            u = User.objects.get(username='admin')
            u.set_password('admin123')
            u.is_superuser = True
            u.is_staff = True
            u.save()
            self.stdout.write('  [OK] User: admin (updated)')
        u.groups.add(admin_group)

        # Staff user
        if not User.objects.filter(username='staff').exists():
            s = User.objects.create_user('staff', 'staff@exam.com', 'staff123')
            s.is_staff = True
            s.save()
            self.stdout.write('  [OK] User: staff / staff123')
        else:
            s = User.objects.get(username='staff')
            s.set_password('staff123')
            s.is_staff = True
            s.save()
            self.stdout.write('  [OK] User: staff (updated)')
        s.groups.add(staff_group)

        # Principal user
        if not User.objects.filter(username='principal').exists():
            p = User.objects.create_user('principal', 'principal@exam.com', 'principal123')
            p.is_staff = True
            p.save()
            self.stdout.write('  [OK] User: principal / principal123')
        else:
            p = User.objects.get(username='principal')
            p.set_password('principal123')
            p.is_staff = True
            p.save()
            self.stdout.write('  [OK] User: principal (updated)')
        p.groups.add(principal_group)

        # ── 3. Add Sample Students ───────────────────────────────────────────
        if Student.objects.count() == 0:
            sample = [
                {'name':'Arjun Kumar',  'school':'Sri Vidya High School, Mysuru',     'phone':'9876543210','version':'A','score':28},
                {'name':'Ranga',        'school':'Jawahar Navodaya, Chitradurga',      'phone':'7204116917','version':'B','score':29},
                {'name':'Punith',       'school':'Vivekananda School, Shivamogga',     'phone':'9632595026','version':'D','score':27},
                {'name':'Rahul Nair',   'school':'Kendriya Vidyalaya, Hassan',         'phone':'9988776655','version':'C','score':25},
                {'name':'Priya Sharma', 'school':'National Public School, Bengaluru',  'phone':'9123456789','version':'B','score':22},
                {'name':'Karthik',      'school':'Sri Vidya High School, Mysuru',      'phone':'9945729329','version':'A','score':20},
                {'name':'Anu',          'school':'Delhi Public School, Mangaluru',     'phone':'8088731651','version':'D','score':18},
                {'name':'Vijay',        'school':'Govt High School, Tumkur',           'phone':'6363572402','version':'C','score':15},
            ]
            students = sorted(sample, key=lambda x: -x['score'])
            for i, s in enumerate(students, 1):
                Student.objects.create(rank=i, **s)
            self.stdout.write(f'  [OK] Added {len(sample)} sample students')
        else:
            self.stdout.write(f'  [--] Students already exist ({Student.objects.count()} records)')

        self.stdout.write('\nSetup complete!')
        self.stdout.write('\nLogin credentials:')
        self.stdout.write('  Django Admin : admin / admin123  -> http://127.0.0.1:8000/admin/')
        self.stdout.write('  Staff user   : staff / staff123')
        self.stdout.write('  Principal    : principal / principal123')
        self.stdout.write('\nFrontend passwords:')
        self.stdout.write('  Staff     : staff123')
        self.stdout.write('  Principal : principal123')
        self.stdout.write('  Admin     : admin123')

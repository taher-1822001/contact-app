from django.shortcuts import render
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from .models import *
from .serializers import *
from django.shortcuts import get_object_or_404
import dropbox
import base64
from io import BytesIO
# Create your views here.
from django.conf import settings
import base64
import dropbox
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import User
from .serializers import UserSerializer
import datetime
import random
import smtplib
from email.mime.text import MIMEText
from django.core.mail import send_mail
from django.template.loader import render_to_string
import requests
from django.db import transaction

class UsersListCreate(APIView):
    serializer_class = UserSerializer
    def get(self, request:Request, *args, **kwargs):
        users = User.objects.all()
        serializer = self.serializer_class(instance=users, many=True)
        response = {
            "message":"User data",
            "data":serializer.data
        }
        return Response(data=response, status=status.HTTP_200_OK)
    
    def generate_otp(self):
        return str(random.randint(100000, 999999))

    def send_otp_email(self, email, otp):
        elastic_email_api_key = settings.EMAIL_API_KEY
        elastic_email_api_url = 'https://api.elasticemail.com/v2/email/send'
        sender_email = settings.EMAIL_HOST_USER
        subject = 'Verify Your Twist Contact App Account'
        message = f'''
        Dear User,\n

        Thank you for registering with the Twist Contact App!\n

        To complete your account registration, please use the following One Time Password (OTP) for verification:\n
        Your OTP: {otp}'''

        payload = {
            'apikey': elastic_email_api_key,
            'from': sender_email,
            'subject': subject,
            'bodyHtml': message,
            'to': email
        }

        try:
            response = requests.post(elastic_email_api_url, data=payload)
            if response.status_code == 200:
                print('OTP sent successfully!')
                return True
            else:
                print('Failed to send OTP:', response.text)
                return False
        except requests.RequestException as e:
            print('Failed to send OTP:', str(e))
            return False

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        data = request.data.copy()
        error_data = {}

        # Validate passwords and ensure they match
        if 'password1' in data and 'password2' in data and data['password1'] == data['password2']:
            data['password'] = data['password2']
        else:
            error_data["password"] = "Passwords don't match"

        email = data.get('email')
        print(email)
        email_exists_active = User.objects.filter(email__iexact=email.strip(), active=True).exists()

        if email_exists_active:
            return Response(data={"email": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)

        email_exists_inactive = User.objects.filter(email__iexact=email.strip(), active=False).exists()

        if email_exists_inactive:
            # If an inactive user with the same email exists, delete it
            User.objects.filter(email__iexact=email.strip(), active=False).delete()

        otp = self.generate_otp()
        data['otp'] = otp
        data['active'] = False  # Set active attribute to False for validation

        if error_data:
            return Response(data=error_data, status=status.HTTP_400_BAD_REQUEST)

        try:
            serializer = self.serializer_class(data=data)

            if serializer.is_valid():
                # Save the user data to the database
                instance = serializer.save()

                # Handle image upload to Dropbox (code unchanged)

                if self.send_otp_email(email, otp):
                    response = {
                        "message": "User created, OTP sent for verification, and image uploaded to Dropbox",
                        "data": serializer.data
                    }
                    return Response(data=response, status=status.HTTP_201_CREATED)
                else:
                    return Response({'error': 'Failed to send OTP'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserRetrieveUpdateDestroy(APIView):
    serializer_class = UserSerializer
    def get(self, request:Request, user_id:uuid):
        user = get_object_or_404(User, pk=user_id)
        serializer = self.serializer_class(instance=user)
        response = {
            "message":"user",
            "data":serializer.data
        }
        return Response(data=response, status=status.HTTP_200_OK)

    def put(self, request:Request, user_id:uuid):
       
        data = request.data.copy()
        errorData = {}

        try:
            access_token = settings.DROP_BOX_KEY
            uploaded_file = request.data.get('image')

            if uploaded_file and isinstance(uploaded_file, str):
                # If 'image' is a string (URL), assume it's already an image path, do nothing
                pass

            elif uploaded_file and hasattr(uploaded_file, 'file'):
                email = data['created_by']
                file_name = uploaded_file.name

                # Read the file content
                file_content = uploaded_file.read()

                # Define Dropbox path for upload
                path = f'/user/userProfiles/{email}/{file_name}'

                # Upload file content to Dropbox
                dbx = dropbox.Dropbox(access_token)
                dbx.files_upload(file_content, path)

                # Construct the shared link for the uploaded file
                shared_link = dbx.sharing_create_shared_link(path).url

                # Update the user data dictionary with the Dropbox file path
                # Modify the shared link URL if needed (change dl=0 to dl=1)
                shared_link = shared_link.replace('dl=0', 'dl=1')
                
                data['image'] = shared_link
                data['updated_on'] = datetime.datetime.now()
            user = get_object_or_404(User, pk=user_id)
            serializer = self.serializer_class(data=data, instance=user)

            if serializer.is_valid():
                serializer.save()

                response = {
                    "message": "user updated and file uploaded to Dropbox",
                    "data": serializer.data
                }
                return Response(data=response, status=status.HTTP_201_CREATED)

            return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    
    def delete(self, request:Request, user_id:uuid):
        user = get_object_or_404(User, pk=user_id)
        user.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


class LoginCheck(APIView):
    serializer_class = UserLoginSerializer

    def post(self, request, *args, **kwargs):
        data = request.data
        email = data.get('email')
        password = data.get('password')

        # Check if the email exists in the database
        try:
            user = User.objects.get(email__iexact=email.strip(), active=True)
        except User.DoesNotExist:
            return Response(data={"email": "Email does not exist"}, status=status.HTTP_404_NOT_FOUND)

        # Check if the provided password matches the user's password
        if user.password != password.strip():
            return Response(data={"password": "Incorrect password"}, status=status.HTTP_401_UNAUTHORIZED)

        # Serialize the user data if needed (based on UserLoginSerializer)
        serializer = self.serializer_class(user)
        response = {
            "id": serializer.data['id'],
            "email":serializer.data['email'],
            'image':serializer.data['image']
        }
        return Response(data=response, status=status.HTTP_200_OK)
    

class RegistrationValidation(APIView):
    serializer_class = UserSerializer
    def patch(self,request:Request, user_id):
        # data = request.data
        active = request.data.get('active')
        user = get_object_or_404(User, pk=user_id)
        
        user.active = True
        user.save()

        # Serialize and return the updated user object
        serializer = self.serializer_class(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
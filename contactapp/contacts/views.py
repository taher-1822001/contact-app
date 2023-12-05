from django.shortcuts import render
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from .serializers import *
from .models import *
from django.conf import settings
import dropbox
import datetime
# Create your views here.
class ContactListCreate(APIView):
    serializer_class = ContactSerializer

    def get(self, request: Request, *args, **kwargs):
        contacts = Contact.objects.all()
        serializer = self.serializer_class(instance=contacts, many=True)
        response = {
            "message": "List Contacts",
            "data": serializer.data
        }
        return Response(data=response, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        data = request.data.copy()
        errorData = {}

        if data['category_id'] == '':
            return Response(data={"category_id": "please select category id"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            access_token = settings.DROP_BOX_KEY
            uploaded_file = request.data.get('image')

            if uploaded_file:  # Check if 'image' exists in the request
                email = data['created_by']
                file_name = uploaded_file.name

                # Read the file content
                file_content = uploaded_file.read()

                # Define Dropbox path for upload
                path = f'/contact/contactProfiles/{email}/{file_name}'

                # Upload file content to Dropbox
                dbx = dropbox.Dropbox(access_token)
                dbx.files_upload(file_content, path)

                # Construct the shared link for the uploaded file
                shared_link = dbx.sharing_create_shared_link(path).url

                # Update the user data dictionary with the Dropbox file path
                # Modify the shared link URL if needed (change dl=0 to dl=1)
                shared_link = shared_link.replace('dl=0', 'dl=1')
                data['image'] = shared_link

            serializer = self.serializer_class(data=data)

            if serializer.is_valid():
                serializer.save()

                response = {
                    "message": "User created and file uploaded to Dropbox",
                    "data": serializer.data
                }
                return Response(data=response, status=status.HTTP_201_CREATED)

            return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ContactListUpdateDestroy(APIView):
    serializer_class = ContactSerializer

    def get(self, request, contact_id):
        contact = get_object_or_404(Contact, pk=contact_id)
        serializer = self.serializer_class(instance=contact)
        response = {
            "message": "Contact",
            "data": serializer.data
        }
        return Response(data=response, status=status.HTTP_200_OK)

    def put(self, request, contact_id: int):
        data = request.data.copy()
        errorData = {}

        if data['category_id'] == '':
            return Response(data={"category_id": "please select category id"}, status=status.HTTP_400_BAD_REQUEST)

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
                path = f'/contact/contactProfiles/{email}/{file_name}'

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
            contact = get_object_or_404(Contact, pk=contact_id)
            serializer = self.serializer_class(data=data, instance=contact)

            if serializer.is_valid():
                serializer.save()

                response = {
                    "message": "Contact updated and file uploaded to Dropbox",
                    "data": serializer.data
                }
                return Response(data=response, status=status.HTTP_201_CREATED)

            return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def delete(self, request:Request,contact_id:int):
        contact = get_object_or_404(Contact, pk=contact_id)
        contact.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


class CategoryListCreate(APIView):
    serializer_class = CategorySerializer
    def get(self, request:Request, *args, **kwargs):
        category = Category.objects.all()
        serializer = self.serializer_class(instance=category, many=True)
        response = {
            "message":"List Category",
            "data":serializer.data
        }
        return Response(data=response, status=status.HTTP_200_OK)
    
    def post(self, request:Request, *args, **kwargs):
        data = request.data
        serializer = self.serializer_class(data=data)
        if serializer.is_valid():
            serializer.save()
            response = {
                "message":"category creaion successful",
                "data":serializer.data
            }
            return Response(data=response, status=status.HTTP_201_CREATED)
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CategoryListUpdateDestroy(APIView):
    serializer_class = CategorySerializer
    def get(self,request:Request, category_id):
        category= get_object_or_404(Category, pk=category_id)
        serializer = self.serializer_class(instance=category)
        response = {
            "message":"Category",
            "data":serializer.data
        }
        return Response(data=response, status=status.HTTP_200_OK)
    
    def put(self,request:Request, category_id:int):
        data = request.data
        category = get_object_or_404(Contact, pk=category_id)
        serializer=self.serializer_class(data=data, instance=category)
        if serializer.is_valid():
            serializer.save()
            response = {
                "message":"category update successfull",
                "data":serializer.data
            }
            return Response(data=response, status=status.HTTP_200_OK)
    
    def delete(self, request:Request,category_id:int):
        category = get_object_or_404(Category, pk=category_id)
        category.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)

class getContactsByUserID(APIView):
    serializer_class = ContactSerializer
    def get(self,request:Request, user_id):
        contact = Contact.objects.filter(user_id=user_id)
        serializer = self.serializer_class(instance=contact, many=True)
        response = {
            "message":"contact",
            "data":serializer.data
        }
        return Response(data=response, status=status.HTTP_200_OK)
        
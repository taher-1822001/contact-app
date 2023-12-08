from django.urls import path
from .views import *
urlpatterns  =[
    path("", UsersListCreate.as_view(), name="list users"),
    path("<uuid:user_id>", UserRetrieveUpdateDestroy.as_view(), name="Retrieve update destroy user"),
    path("login", LoginCheck.as_view(), name="login check"),
    path("register/<uuid:user_id>", RegistrationValidation.as_view(), name='registeration validation'),
    path("password/reset/<uuid:user_id>", newPassword.as_view(), name='update password'),
    path('pswdemail',PasswordReset.as_view(), name='send email'),
    path('getid',GetUserIdByEmail.as_view(), name='get id'),
]
from django.urls import path
from .views import *
urlpatterns  =[
    path("", UsersListCreate.as_view(), name="list users"),
    path("<uuid:user_id>", UserRetrieveUpdateDestroy.as_view(), name="Retrieve update destroy user"),
    path("login", LoginCheck.as_view(), name="login check")
]
#!/bin/bash
cd /app/backend
exec gunicorn --bind 0.0.0.0:8001 --workers 2 --reload flowerbackend.wsgi:application

#!/usr/bin/python3
import os
import subprocess
import sys

subprocess.call(['python3', '-m', 'venv', 'env'])
if sys.platform == 'win32':
    bin = 'Scripts'
else:
    bin = 'bin'

subprocess.call([os.path.join('env', bin, 'pip'), 'install', '--upgrade', 'django'])
subprocess.call([os.path.join('env', bin, 'pip'), 'install', '--upgrade', 'psycopg2'])
subprocess.call([os.path.join('env', bin, 'pip'), 'install', '-r', 'requirements.txt'])

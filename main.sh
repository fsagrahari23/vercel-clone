#!/bin/bash
set -e

git clone "https://github.com/fsagrahari23/test-app.git" /home/app/output

exec node script.js

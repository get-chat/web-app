#!/bin/bash
set -e

cd /opt/inbox-frontend
envsubst <config.json.tmpl >config.json
rm config.json.tmpl

exit 0

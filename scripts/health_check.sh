#!/bin/bash
curl -f http://localhost:8000/ || exit 1
curl -f http://localhost:3000/ || exit 1
echo "Health check passed"

#!/bin/sh

docker buildx build --platform linux/amd64,linux/arm64 --push -t ghcr.io/cory-evans/guess-that-dj:latest .
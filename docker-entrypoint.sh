#!/bin/sh
set -eu

DATA_ROOT="${DATA_ROOT:-/app/data}"

mkdir -p "${DATA_ROOT}"
mkdir -p "${DATA_ROOT}/tmp"
mkdir -p "${DATA_ROOT}/cases"

exec "$@"
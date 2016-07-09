#!/bin/bash
set -eu
root_dir=$(cd $(dirname $0) && cd .. && pwd)
data_dir=$root_dir/tmp/testdata
outpath=$data_dir/browser.js

function usage() {
    echo "usage: $(basename $0)"
    exit 1
}

function build() {
    local series=$1
    local work_dir=$data_dir/$series

    if [ ! -d $work_dir ]; then
        echo "$series testdata not found: perhaps you will need to run 'npm run testdata'"
        exit 2
    fi

    pushd $work_dir >/dev/null

    cat <<EOF >> $outpath
testdata.$series = {};
EOF

    local file
    for file in *.json; do
        local prop=$(basename $file .json)
        local json=$(cat $file)
        cat <<EOF >> $outpath
testdata.$series.$prop = $json;
EOF
    done

    popd >/dev/null
}

if [ $# -ne 0 ]; then
    usage
fi

if [ ! -d $data_dir ]; then
    mkdir -p $data_dir
fi

cat <<EOF > $outpath
var testdata = {};
EOF

build 'mh4g'

echo "build: $outpath"

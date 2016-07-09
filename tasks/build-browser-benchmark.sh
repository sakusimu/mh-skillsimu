#!/bin/bash
set -eu
root_dir=$(cd $(dirname $0) && cd .. && pwd)
in_dir=$root_dir/benchmarks
out_dir=$root_dir/tmp/benchmarks

opts="-t [ babelify --presets [ es2015 ] ]"

function usage() {
    echo "usage: $(basename $0)"
    exit 1
}

function browserify() {
    local script=$1

    echo "build: $script"
    $(npm bin)/browserify $in_dir/$script $opts -o $out_dir/$script
}

if [ $# -ne 0 ]; then
    usage
fi

[ ! -d $out_dir ] && mkdir -p $out_dir

browserify 'mh4g-equip-simu.js'
browserify 'mh4g-deco-simu.js'

echo "To run a benchmark script on Browser, open benchmarks/html/~.html in your Browser."

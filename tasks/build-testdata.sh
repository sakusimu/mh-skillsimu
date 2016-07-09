#!/bin/bash
set -eu
root_dir=$(cd $(dirname $0) && cd .. && pwd)
data_dir=$root_dir/tmp/testdata

mh4g=(
    http://sakusimu.net/data/mh4g/equip_head.json
    http://sakusimu.net/data/mh4g/equip_body.json
    http://sakusimu.net/data/mh4g/equip_arm.json
    http://sakusimu.net/data/mh4g/equip_waist.json
    http://sakusimu.net/data/mh4g/equip_leg.json
    http://sakusimu.net/data/mh4g/deco.json
    http://sakusimu.net/data/mh4g/skill.json
    http://sakusimu.net/data/mh4g/version.txt
)

function usage() {
    echo "usage: $(basename $0) [mh4g|mhx]"
    exit 1
}

function download() {
    local args=($@)
    local series=${args[0]}
    local urls=("${args[@]:1}")

    echo "download: $series"

    work_dir=$data_dir/$series
    [ -d $work_dir ] && rm -r $work_dir
    mkdir -p $work_dir
    pushd $work_dir >/dev/null

    for url in ${urls[@]}; do
        echo $url
        curl -LO --silent --show-error $url
        sleep 1
    done

    popd >/dev/null
}

if [ $# -eq 0 ]; then
    series="all"
elif [ $# -eq 1 ]; then
    series=$1
else
    usage
fi

if [ ! -d $data_dir ]; then
    mkdir -p $data_dir
fi

case $series in
    all)
        download 'mh4g' ${mh4g[@]}
        ;;
    mh4g)
        download 'mh4g' ${mh4g[@]}
        ;;
    *)
        echo "unknown MH series: $series"
        usage
        ;;
esac

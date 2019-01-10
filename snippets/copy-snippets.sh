#!/usr/bin/env bash

cp -r $1/* ./

sed -i'.original' -e 's/ \{1,\}"pincode" : .\{1,\}//g' -e '/^$/d' ./**/*.adoc

rm -rf ./**/*.original
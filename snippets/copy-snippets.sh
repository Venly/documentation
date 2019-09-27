#!/usr/bin/env bash

cp -r $1/* ./pin
cp -r $1/* ./noPin

sed -i'.original' -e 's/ \{1,\}"pincode" : .\{1,\}//g' -e '/^$/d' ./noPin/**/*.adoc

rm -rf ./**/*.original
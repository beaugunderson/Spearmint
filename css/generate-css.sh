#!/bin/bash

for scss in [a-z]*.scss; do
	css=$(basename $scss .scss).css

	echo "Compiling $scss to $css (and making it read-only)..."

	sass --style expanded $scss > $css

	chmod a-w $css
done

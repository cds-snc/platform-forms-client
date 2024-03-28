find $javascript_dir -type f -name "*.js" -print | while read file_name
do
    basename=$(basename $file_name)
    echo "\"use client\";" > "$basename.tmp"
    cat "$file_name" >> "$basename.tmp"
    mv "$basename.tmp" "$file_name"
done
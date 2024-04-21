
#!/bin/bash

bin_dir=$(dirname $0)
prettier_config="$bin_dir/../.prettierrc.yml"

function usage() {
    echo "FIXME: Buggy, some code blocks are not properly formatted or even broken"
    echo "Usage: $0 --lang=<javascript> --codeblocks=<blocks languages> <file.md>"
    echo "Formats the code blocks in a markdown file, starting with blocks languages, 
        according to the language specified "
    echo "Options:"
    echo "  --lang=<javascript>  The language to format the code blocks to"
    echo "  --codeblocks=<blocks languages>  The languages of the code blocks to format, e. g. dataviewjs, sigma-js..."
    echo "  <file.md>  The markdown file to format"
    echo " Output is written to stdout"
    exit 1
}


function find_ranges() {
    local start_delim="$1"
    local end_delim="$2"
    local file="$3"

    cat "$file" \
        | awk -v start_delim="$start_delim" -v end_delim="$end_delim" \
            '
            function max(n1, n2) {
                return (n1 > n2) ? n1 : n2;
            }

            function min(n1, n2) {
                return (n1 < n2) ? n1 : n2;
            }

            function print_formatter_range(st, p1, p2) {
                if(prev_status == "I") {
                    p1=min(p1 + 1, NR);
                    p2=max(p2 - 1, 1);
                    f="F";
                } else {
                    p1=max(p1 - 1, 1);
                    p2=min(p2 + 1, NR);
                    f="N";
                }
                
                print f ":" p1 "," p2 ; 
            }

            BEGIN { 
                marks[0]="";
                prev_mark=""
            }

            {
                if($0 == start_delim) {
                    prev_mark=marks[NR]="S";
                } else if($0 == end_delim && prev_mark == "S") {
                    prev_mark=marks[NR]="E";
                }
            } 

            END {
                current_status="";
                prev_status=(marks[1] == "S") ? "I" : "O";

                start_pos=1;
                change=0;

                for(i=2; i<=NR; i++) {
                    current_mark=marks[i];
                    prev_mark=marks[i - 1];

                    consecutive=(prev_mark == "E" && current_mark == "S");
                    entered=(current_mark == "S" && prev_status == "O");
                    exited=(prev_mark == "E");

                    if(consecutive || entered) {
                        current_status="I";
                        change=1;
                    } 
                    else if(exited) {
                        current_status="O";
                        change=1;
                    }

                    if(change) {
                        change=0;
                        end_pos=i - 1;

                        print_formatter_range(prev_status, start_pos, end_pos); 

                        start_pos=i;
                        prev_status=current_status;
                    }
                    
                    if(i == NR) {
                        end_pos=i;
                        print_formatter_range(current_status, start_pos, end_pos);
                    }
                }
            }
            
            ' \
            | tr '\n' ';'
}

function format_ranges() {
    local file="$1"
    local ranges="$2"

    local new_file="$file.new"
    local ranges_array=(${ranges//;/ });
    
    for range in "${ranges_array[@]}"
    do
        # echo "PROCESSING RANGE: $range"

        local status=${range:0:1}
        local start_end=${range:2}
        

        if [ "$status" = "F" ]; then
            # echo "============ FORMATTER START, status:[$status], start_end: [$start_end]"
            cat "$file" | sed -n "${start_end}p" | ../node_modules/.bin/prettier --config $prettier_config --parser babel
            # echo "============ FORMATTER END"
        else
            # echo "============ NOT FORMATTER START, status: $status, start_end: $start_end"
            cat "$file" | sed -n "${start_end}p"
            # echo "============ NOT FORMATTER END"
        fi

    done
}

function javascript_formatter() {
    local file="$1"
    local codeblocks=$2
    codeblocks=${codeblocks/,/ }

    local backticks='```'
    local block_end="$backticks"

    local work_file="${file}.work.md"
    cp "$file" "$work_file"
    
    for block in $(echo $codeblocks)
    do
        local block_start="$backticks$block"
        local block_ranges=$(find_ranges $block_start $block_end "$work_file")
        # echo "$block_ranges"
        format_ranges "$work_file" "$block_ranges" | tee "${work_file}.tmp"
        mv "${work_file}.tmp" "$work_file"
    done

    mv "$work_file" "$file"

    # echo "$ranges"
}

# Parse command line arguments
while [ $# -gt 0 ]; do
    case "$1" in
        --lang=*)
            lang="${1#*=}"
            ;;
        --codeblocks=*)
            codeblocks="${1#*=}"
            ;;
        *)
            file="$1"
            ;;
    esac
    shift
done

if [ -z "$lang" ] || [ -z "$codeblocks" ] || [ -z "$file" ]; then
    usage
fi

if [ ! -f "$file" ]; then
    echo "File not found: $file"
    exit 1
fi

# Format the code blocks
if [[ "$lang"=="javascript" ]]; then
    javascript_formatter "$file" "$codeblocks"

else
    echo "Language not supported: $lang"
    exit 1
fi

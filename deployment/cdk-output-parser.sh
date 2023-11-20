set -eu

test -n "$1" || { echo "The argument root node must be provided"; exit 1; }
root="$1"

test -n "$2" || { echo "The argument keymatch must be provided"; exit 1; }
keymatch="$2"

test -n "$3" || { echo "The argument filename must be provided"; exit 1; }
filename="$3"

jq -r --arg root "$root" --arg keymatch "$keymatch" '.[$root] |
with_entries(select(.key|match($keymatch)))[]
' $filename
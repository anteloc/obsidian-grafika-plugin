#!/bin/bash

root_dir="$(dirname $0)/.."

function usage() {
    echo "Usage: $0 --version [auto | x.y.z]"
    echo "
    This script should **always** be run on the 'master' branch.
    It will prepare a new release by doing the following:
    1. Set the new version number in manifest.json, package.json and other files if needed. 
    - If version=x.y.z, it will set that version number.
    - If version=auto, it will calculate a new x.y.z version number by doing the following:
        1. x = current major version number
        2. y = current minor version number + 1
        3. z = 0
        
        E. g., if current version is 1.2.3, the new version will be 1.3.0

    2. Replace the __RELEASE_VERSION__ placeholder by that new version number 
        on *.md files and other files if needed.
    3. Create a new tag for the new version
    4. Print the required commands to run manually to start building the release at Github.
    "
}

function get_current_version() {
    local manifest_file=$root_dir/manifest.json
    local version=$(grep '"version":' $manifest_file | cut -d '"' -f 4)
    echo $version
}

function increase_version() {
    local current_version=$1
    local new_version=$(echo $current_version | awk -F. -v OFS=. '{print $1 "." $2+1 ".0"}')
    # local new_version=$(echo $current_version | awk -F. -v OFS=. '{$NF=$NF+1; print $0}')
    echo $new_version
}

function set_version() {
    local version=$1
    local manifest_file=$root_dir/manifest.json
    local package_file=$root_dir/package.json

    # Set the new version in manifest.json
    sed -i "s/\"version\": \".*\"/\"version\": \"$version\"/" $manifest_file

    # Set the new version in package.json
    sed -i "s/\"version\": \".*\"/\"version\": \"$version\"/" $package_file
}

function replace_version() {
    local version=$1
    # Replace the __RELEASE_VERSION__ placeholder by the new version number in template markdown files
    local templates=$(grep -r -l "__RELEASE_VERSION__" $root_dir | grep -v prepare-release.sh | grep '.*-template.md')

    echo "Setting version $version in the following templates:"

    for template in $templates; do
        local file="${template/-template/}"
        cp "$template" "$file"
        echo "  $template -> $file"
        sed -i "s/__RELEASE_VERSION__/$version/g" "$file"
    done
}

function create_tag() {
    local version=$1

    echo "Creating tag: $version"

    git add $root_dir
    git commit -m "Release version $version"
    git tag -a $version -m "$version"
}

# If no arguments are given, print usage() and exit
if [ $# -eq 0 ]; then
    usage
    exit 0
fi

# If current branch is not 'master', print error message and exit
if [ "$(git rev-parse --abbrev-ref HEAD)" != "master" ]; then
    echo "This script should always be run on the 'master' branch."
    exit 1
fi

# Parse arguments
while [ "$1" != "" ]; do
    case $1 in
    --version)
        shift
        VERSION=$1
        ;;
    *)
        usage
        exit 1
        ;;
    esac
    shift
done

current_version=$(get_current_version)

# If version is 'auto', increase the current version number
if [ "$VERSION" == "auto" ]; then
    VERSION=$(increase_version $current_version)
fi

# Show version information to the user and ask for confirmation
echo "Preparing release, current version: $current_version, new version: $VERSION"
echo "Verify that the following are up-to-date: "
echo "  - README.md"
echo "  - Directory 'demo'"
echo "  - Directory 'docs'"
echo "Do you want to continue? (y/n)"
read -r response

if [ "$response" != "y" ]; then
    echo "Exiting..."
    exit 0
fi

$root_dir/scripts/codeblocks-formatter.sh $root_dir/demo

set_version $VERSION
replace_version $VERSION
create_tag $VERSION
echo "Release prepared. Now run the following to start building the release at Github:"
echo "  git push origin master"


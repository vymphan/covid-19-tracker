#!/bin/sh

gitlab-runner restart

build_branch () {
    branch=$1

    git reset --hard HEAD
    git branch -f $branch origin/$branch

    # checkout desired branch
    git checkout $branch
    git pull
#grep title public/index.html

    # restore modules
    npm install
    # do build
    npm run build

    # aggregate into allout directory
    mv build allout/$branch
}

# make sure allout exists
mkdir -p ./allout

build_branch "master"
build_branch "checkpoint1"
build_branch "checkpoint3"
build_branch "checkpoint5"
build_branch "checkpoint6"
build_branch "checkpoint7"

# couldn't get this to work
## get all branches starting with checkpoint or master
#for BRANCH in $(git branch --remote | grep -E '((checkpoint)|(master))'); do
    #echo "$BRANCH"
    ## build current branch
    #build_branch $BRANCH
#done

# move aggregate output to public for hosting by gitlab
rm -rf public
mv allout public
# copy master to the root
cp -a public/master/. public/

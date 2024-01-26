#!/usr/bin/env bash
set -o errexit

print_usage () {
  echo "Usage: $0 [-c <collection>=<name>] [-d <db>=<name>] <command>"
  echo ""
  echo "Commands :"
  echo "  create       create db/collection"
  echo "  remove       remove db/collection"
  echo "  backup       backup db/collection"

  echo "Options  :"
  echo "  -c           collection"
  echo "  -d           database"
}

remove_usage () {
  echo "Usage: "
  echo "  Collection: $0 -d <database_name> -c <collection_name> remove"
  echo "  DB        : $0 -d <database_name> remove"
}

backup_usage () {
  echo "Usage: "
  echo "  Collection: $0 -d <database_name> -c <collection_name> backup"
  echo "  DB        : $0 -d <database_name> backup"
}

if [ $# -lt 1 ]; then 
 print_usage; exit 1 
fi

while getopts ":c:d:" opt; do

  case $opt in
    c) if [ $OPTARG = "-d" ]; then 
         echo "-$opt expects a collection name"; exit 1
       else
         echo "opt c arg $OPTARG"
         collection=$OPTARG
       fi;;
    d) if [ $OPTARG = "-c" ]; then 
         echo "-$opt expects a database name"; exit 1
       else 
         echo "opt d arg $OPTARG"
         database=$OPTARG
       fi;;
    :) case $OPTARG in
         c) echo "option -c required argument" ; exit 1;;
         d) echo "option -d required argument" ; exit 1;;
       esac
       ;;
    \?)
      echo "Invalid option: -$OPTARG"; rm_usage exit 1
      ;;
  esac
done

shift $((OPTIND -1))


if [ $# = 1 ]; then
  if [ $1 = "remove" ]; then
    echo "rm command db: ${database} col: ${collection}"
    if [ -z ${database} ]; then 
      echo "-d option required to specify db name"; remove_usage; exit 1
    elif [ -z ${collection} ]; then
      mongosh $database --eval  "db.dropDatabase()"
    else
      mongosh $database --eval "db.${collection}.drop()"
    fi
  elif [ $1 = "create" ]; then
    echo "create command in progress"
  elif [ $1 = "backup" ]; then
    if [ -z ${database} ]; then
      echo "-d option required to specify db name"; backup_usage; exit 1
    elif [ -z ${collection} ]; then
      mongodump --db $database --out ./$(date +'%m-%d-%y')
    else
      echo "backup collection in progress"
    fi
  else 
    echo "$1 is not a command"
  fi
else
  echo "Invalid command $@" #TODO:: handle parameters for multiple arguments
fi
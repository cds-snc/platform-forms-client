if [ $# -eq 0 ]
  then
    echo "No arguments supplied"
    exit
fi
ENVIRONMENT=$1
kubectl create namespace benefits-$ENVIRONMENT

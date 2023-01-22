
  # --------------------------------------------------------------------#
  #         File: install_container.sh                                  #
  #      Project: https://github.com/WISE-Developers/wise_demo          #
  #       Author: Franco H. M. Nogarin                                  #
  # --------------------------------------------------------------------#
  clear
  start_time=$SECONDS

  # Read int he ENV file
  if [ -f .env ]; then
    export $(cat .env | sed 's/#.*//g' | xargs)
    else
      echo "No .env file found - please read the README.md file and create one"
      exit 1
  fi

  R=$(($RANDOM % 6))
  if [ $R == '0' ]; then
  echo "
      __      __ .___   ____________________                
     /  \    /  \|   | /   _____/\_   _____/                
     \   \/\/   /|   | \_____  \  |    __)_                 
      \        / |   | /        \ |        \                
       \__/\  /  |___|/_______  //_______  /                
            \/                \/         \/           "   
    echo " "           
    echo "-= Wildfire Intelligence and Simulation Engine =-"                                              
    echo " "
    
  elif [ $R == '1' ]; then
    echo " 
██     ██    ██    ███████    ███████    
██     ██    ██    ██         ██         
██  █  ██    ██    ███████    █████      
██ ███ ██    ██         ██    ██         
 ███ ███  ██ ██ ██ ███████ ██ ███████ ██ "
  echo "-= Wildfire Intelligence and Simulation Engine =-"
    echo " "
  elif [ $R == '2' ]; then

    echo "     
 __          _______    _____  ______   
 \ \        / /_   _|  / ____||  ____|  
  \ \  /\  / /  | |   | (___  | |__     
   \ \/  \/ /   | |    \___ \ |  __|    
    \  /\  /   _| |_ _ ____) || |____ _ 
     \/  \(_) |_____(_)_____(_)______(_)     "
     echo "-= Wildfire Intelligence and Simulation Engine =-"
    echo " "

  elif [ $R == '3' ]; then
    echo "
            (       (               
 (  (       )\ )    )\ )            
 )\))(   ' (()/(   (()/(    (       
((_)()\ )   /(_))   /(_))   )\      
_(())\_)() (_))    (_))    ((_)     
\ \((_)/ / |_ _|   / __|   | __|    
 \ \/\/ /_  | |  _ \__ \ _ | _|  _  
  \_/\_/(_)|___|(_)|___/(_)|___|(_) "
  echo "-= Wildfire Intelligence and Simulation Engine =-"
    echo " "
  elif [ $R == '4' ]; then
    echo "
         _       __  ____ _____   ______
        | |     / / /  _// ___/  / ____/
        | | /| / /  / /  \__ \  / __/   
        | |/ |/ / _/ /_ ___/ / / /____  
        |__/|__(_)___(_)____(_)_____(_) "
        echo " "
echo "-= Wildfire Intelligence and Simulation Engine =-"
    echo " "
  elif [ $R == '5' ]; then
    
    echo "-=================  W.I.S.E. ===================-"
    echo "-= Wildfire Intelligence and Simulation Engine =-"
  fi
  currentDate=$(date)
  echo "Installer Design & Build by Franco Nogarin"
  echo "_______________________________________________________________________________"
  echo $currentDate
  echo "Starting WISE Demo INSTALL for Containers"
  echo " "
  echo "Using configuration data:"
  echo "========================="
  cat .env
   echo "_______________________________________________________________________________"
  echo " "
 # make the host data folder
 echo "Creating the host data folder..."
 mkdir -p $HOST_DATA_FOLDER
 #  do a recursive copy the of test job folder to the shared folder:
 echo "Copying the test job to the shared folder..."
 cp -R ./demo_data/testjob $HOST_DATA_FOLDER



  echo "Bringing the stack up..."
  docker-compose up -d  --build;
  if [ $? -ne 0 ]; then
    echo "Error bringing the stack up. Exiting."
    exit 1
  fi
  echo "The stack is up." 
  echo "Starting WISE Demo INSTALL complete."
  currentDate=$(date)
  echo " "
  echo " "
  echo "Install Setup Report."
  echo "=============================================================="
  echo "Deployed: " $currentDate
  echo "Deployment Type: Container"
  echo "Install Host: " $HOSTNAME
  echo "Auth Port: " $AUTH_EXPOSED_PORT
  echo "Web Port: " $WEB_EXPOSED_PORT
  echo "Enterprise Data Folder: " $ENTERPRISE_DATA_FOLDER
  echo "Deployed from: " $PWD

  elapsed=$(( SECONDS - start_time ))
  eval "echo Elapsed time: $(date -ud "@$elapsed" +'$((%s/3600/24)) days %H hr %M min %S sec')"

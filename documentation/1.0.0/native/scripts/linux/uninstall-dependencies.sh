#!/bin/bash

# Define color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Function to show the menu
show_menu() {
    echo -e "${GREEN}Please choose an option to uninstall:${NC}"
    echo "1) PM2"
    echo "2) Node.js and npm"
    echo "3) Kafka and Zookeeper"
    echo "4) Redis"
    echo "5) Redis BullMQ"
    echo "6) MongoDB"
    echo "7) Citus and PostgreSQL"
    echo "8) Gotenberg"
    echo "9) Exit"
    echo -e "${GREEN}Enter your choice [1-9]: ${NC}"
}

# Function to uninstall PM2
uninstall_pm2() {
    echo -e "${RED}Uninstalling PM2...${NC}"
    sudo npm uninstall -g pm2
}

# Function to uninstall Node.js and npm
uninstall_nodejs() {
    echo -e "${RED}Uninstalling Node.js and npm...${NC}"
    sudo apt-get remove -y nodejs
    sudo apt-get purge -y nodejs
    sudo apt-get autoremove -y
}

# Function to uninstall Kafka and Zookeeper
uninstall_kafka_zookeeper() {
    echo -e "${RED}Removing Kafka and Zookeeper...${NC}"
    sudo systemctl stop kafka
    sudo systemctl disable kafka
    sudo systemctl stop zookeeper
    sudo systemctl disable zookeeper
    sudo rm /etc/systemd/system/kafka.service
    sudo rm /etc/systemd/system/zookeeper.service
    sudo rm -rf /opt/kafka
    sudo systemctl daemon-reload
}

# Function to uninstall Redis
uninstall_redis() {
    echo -e "${RED}Uninstalling Redis...${NC}"
    sudo systemctl stop redis
    sudo systemctl disable redis
    sudo apt-get remove -y redis-server
    sudo apt-get purge -y redis-server
    sudo apt-get autoremove -y
}

# Function to uninstall Redis BullMQ
uninstall_bullmq() {
    echo -e "${RED}Uninstalling Redis BullMQ...${NC}"
    sudo npm uninstall -g bullmq
    echo -e "${GREEN}Redis BullMQ has been uninstalled.${NC}"
}

# Function to uninstall MongoDB
uninstall_mongodb() {
    echo -e "${RED}Uninstalling MongoDB...${NC}"
    sudo systemctl stop mongod
    sudo systemctl disable mongod
    sudo apt-get remove -y mongodb-org
    sudo apt-get purge -y mongodb-org
    sudo apt-get autoremove -y
    sudo rm -rf /var/log/mongodb
    sudo rm -rf /var/lib/mongodb
    sudo rm /etc/apt/sources.list.d/mongodb-org-*.list
    echo -e "${GREEN}MongoDB has been uninstalled.${NC}"
}

# Function to uninstall Citus and PostgreSQL
uninstall_citus_postgresql() {
    echo -e "${RED}Uninstalling Citus and PostgreSQL...${NC}"
    sudo su - postgres -c "pg_ctl -D ~/citus stop"
    sudo apt-get remove -y postgresql-16-citus-12.1
    sudo apt-get purge -y postgresql-16-citus-12.1
    sudo apt-get remove -y postgresql*
    sudo apt-get purge -y postgresql*
    sudo apt-get autoremove -y
    sudo pkill -u postgres
    sudo deluser --remove-home postgres
}

# Function to uninstall Gotenberg
uninstall_gotenberg() {
    echo -e "${RED}Uninstalling Gotenberg...${NC}"
    
    # Stop and remove the Gotenberg Docker container
    sudo docker stop gotenberg
    sudo docker rm gotenberg

    # Optionally uninstall Docker (if it's no longer needed)
    echo -e "${GREEN}Do you also want to uninstall Docker? (y/n)${NC}"
    read uninstall_docker
    if [[ "$uninstall_docker" == "y" || "$uninstall_docker" == "Y" ]]; then
        echo -e "${RED}Uninstalling Docker...${NC}"
        sudo apt-get remove -y docker.io
        sudo apt-get purge -y docker.io
        sudo apt-get autoremove -y
        sudo rm -rf /var/lib/docker
        echo -e "${GREEN}Docker has been uninstalled.${NC}"
    fi
    echo -e "${GREEN}Gotenberg has been uninstalled.${NC}"
}

# Main loop
while true; do
    show_menu
    read choice
    case $choice in
        1) uninstall_pm2 ;;
        2) uninstall_nodejs ;;
        3) uninstall_kafka_zookeeper ;;
        4) uninstall_redis ;;
        5) uninstall_bullmq ;;
        6) uninstall_mongodb ;;
        7) uninstall_citus_postgresql ;;
        8) uninstall_gotenberg ;;
        9) echo -e "${GREEN}Exiting uninstallation process.${NC}"; exit ;;
        *) echo -e "${RED}Invalid option, please try again.${NC}" ;;
    esac
    echo -e "${GREEN}Operation completed.${NC}"
done

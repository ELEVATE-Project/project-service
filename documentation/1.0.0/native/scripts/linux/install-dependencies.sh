#!/bin/bash

echo "Starting the installation script..."

# Function to install Node.js LTS
install_nodejs() {
    echo "Installing Node.js version 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs
    sudo DEBIAN_FRONTEND=noninteractive apt-get install -y build-essential
}


# Function to install Kafka
install_kafka() {
    echo "Installing Kafka..."
    sudo DEBIAN_FRONTEND=noninteractive apt install -y openjdk-11-jdk
    sudo wget https://archive.apache.org/dist/kafka/3.5.0/kafka_2.12-3.5.0.tgz -O kafka.tgz
    sudo tar xzf kafka.tgz -C /opt
    sudo mv /opt/kafka_2.12-3.5.0 /opt/kafka

    echo "Creating Zookeeper service..."
    sudo bash -c 'cat > /etc/systemd/system/zookeeper.service << EOF
[Unit]
Description=Apache Zookeeper service
Documentation=http://zookeeper.apache.org
Requires=network.target remote-fs.target
After=network.target remote-fs.target

[Service]
Type=simple
ExecStart=/opt/kafka/bin/zookeeper-server-start.sh /opt/kafka/config/zookeeper.properties
ExecStop=/opt/kafka/bin/zookeeper-server-stop.sh
Restart=on-abnormal

[Install]
WantedBy=multi-user.target
EOF'

    echo "Creating Kafka service..."
    sudo bash -c 'cat > /etc/systemd/system/kafka.service << EOF
[Unit]
Description=Apache Kafka Service
Documentation=http://kafka.apache.org/documentation.html
Requires=zookeeper.service

[Service]
Type=simple
Environment="JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64"
ExecStart=/opt/kafka/bin/kafka-server-start.sh /opt/kafka/config/server.properties
ExecStop=/opt/kafka/bin/kafka-server-stop.sh

[Install]
WantedBy=multi-user.target
EOF'

    sudo systemctl daemon-reload
    sudo systemctl start zookeeper
    sudo systemctl start kafka
}

# Function to install Redis
install_redis() {
    echo "Installing Redis..."
    sudo apt update
    sudo DEBIAN_FRONTEND=noninteractive apt install -y redis-server
    sudo sed -i 's/^# *supervised .*/supervised systemd/' /etc/redis/redis.conf
    sudo systemctl restart redis.service
}

# Function to install Redis BullMQ (as a global Node.js package)
install_bullmq() {
    echo "Installing Redis BullMQ..."
    sudo npm install -g bullmq
    echo "Redis BullMQ has been installed globally."
}

# Function to install Citus
install_citus() {
    echo "Installing Citus..."

    # Ensure the 'postgres' user exists
    if ! id "postgres" &>/dev/null; then
        echo "Creating postgres user..."
        sudo useradd -m -s /bin/bash postgres
        echo "postgres user created."
    else
        echo "postgres user already exists."
    fi

    # Download and install the Citus repository setup script
    curl https://install.citusdata.com/community/deb.sh | sudo bash

    # Install Citus along with PostgreSQL
    sudo DEBIAN_FRONTEND=noninteractive apt-get install -y postgresql-16-citus-12.1

    # Switch to the postgres user
    sudo su - postgres <<EOF

    # Set PostgreSQL bin directory in the PATH (modify the path according to your PostgreSQL installation)
    export PATH=\$PATH:/usr/lib/postgresql/16/bin

    # Create a directory for Citus
    mkdir ~/citus

    # Initialize the Citus data directory
    initdb -D ~/citus

    # Configure Citus in postgresql.conf
    echo "shared_preload_libraries = 'citus'" >> ~/citus/postgresql.conf

    # Start the Citus server
    pg_ctl -D ~/citus -o "-p 9700" -l ~/citus_logfile start

    # Create the Citus extension
    psql -p 9700 -c "CREATE EXTENSION citus;"

    # Check the Citus version
    PSQL_OUTPUT=\$(psql -p 9700 -c "select citus_version();")
    echo "\$PSQL_OUTPUT"

EOF
}

# Function to install PM2
install_pm2() {
    echo "Installing PM2..."
    sudo npm install pm2@latest -g
}

# Function to install MongoDB
install_mongo() {
    echo "Installing MongoDB 4.4.14..."

    # Import MongoDB public GPG key
    wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -

    # Create the MongoDB source list for Ubuntu (MongoDB 4.4)
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list

    # Update apt and install MongoDB version 4.4.14
    sudo apt update
    sudo DEBIAN_FRONTEND=noninteractive apt install -y mongodb-org=4.4.14 mongodb-org-server=4.4.14 mongodb-org-shell=4.4.14 mongodb-org-mongos=4.4.14 mongodb-org-tools=4.4.14

    # Start and enable MongoDB service
    sudo systemctl start mongod
    sudo systemctl enable mongod
    echo "MongoDB 4.4.14 has been installed and started."
}


# Function to install Gotenberg (via Docker)
install_gotenberg() {
    echo "Installing Docker (required for Gotenberg)..."
    
    # Install Docker
    sudo apt update
    sudo DEBIAN_FRONTEND=noninteractive apt install -y docker.io

    # Start and enable Docker service
    sudo systemctl start docker
    sudo systemctl enable docker

    echo "Docker installed. Pulling Gotenberg Docker image..."

    # Pull and run Gotenberg Docker container
    sudo docker pull gotenberg/gotenberg:7
    sudo docker run -d --name gotenberg -p 3000:3000 gotenberg/gotenberg:7

    echo "Gotenberg has been installed and started on port 3000."
}

# Function to display options
display_menu() {
    echo "Please select an installation option:"
    options=("Install Node.js" "Install Kafka" "Install Redis" "Install Citus" "Install PM2" "Install MongoDB" "Install Gotenberg" "Exit")
    for i in ${!options[@]}; do
        echo "$((i+1)). ${options[i]}"
    done
}

# Main menu
display_menu

while true; do
    read -p "Enter your choice (1-${#options[@]}): " choice
    if (( choice > 0 && choice <= ${#options[@]} )); then
        case $choice in
            1) install_nodejs ;;
            2) install_kafka ;;
            3) install_redis ;;
            4) install_citus ;;
            5) install_pm2 ;;
            6) install_mongo ;;
            7) install_gotenberg ;;
            8) echo "Exiting the installation script."; break ;;
            *) echo "Invalid option. Please try again." ;;
        esac
        echo "Operation completed. Here are the next options:"
        display_menu
    else
        echo "Invalid option. Please try again."
    fi
done

echo "Installation script completed."

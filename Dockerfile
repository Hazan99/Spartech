FROM node:20


   # Update package lists and install required tools (wget and unzip)
   RUN apt-get update && apt-get install -y wget unzip && apt-get clean

   # Retrieve the specific zip file from the GitHub repository using wget
   RUN wget -O deploy.zip https://github.com/Hazan99/codes/raw/main/Queen_Anita-V3.zip

   # Extract the contents of the downloaded zip file
   RUN unzip deploy.zip && rm deploy.zip
   WORKDIR /app/Queen_Anita-V3

   # Install modules and start the application
   RUN npm install
   CMD ["npm", "start"]

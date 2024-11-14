# Step 1: Use an official Node.js image as the base
FROM node:18-alpine

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json to the container
COPY package*.json ./

# Step 4: Install the dependencies
RUN npm install

# Step 5: Copy the rest of the application code
COPY . .

# Step 6: Build the React app
RUN npm run build

# Step 7: Expose the port you want to run the React app on (3000)
EXPOSE 3000

# Step 8: Set the environment variable to run the app on port 3000
ENV PORT=3000

# Step 9: Start the React app
CMD ["npm", "start"]

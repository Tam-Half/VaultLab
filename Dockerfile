FROM node:18

# Tạo thư mục app trong container
WORKDIR /app

# Copy package.json trước để tối ưu cache
COPY package*.json ./

# Cài dependencies
RUN npm install

# Copy code vào container
COPY . .

# Expose port 3000 cho backend
EXPOSE 3000

# Chạy app
CMD ["npm", "start"]

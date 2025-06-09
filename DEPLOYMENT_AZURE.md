# Deploying Node.js Project with Frontend and Backend to Azure App Service

This guide explains how to deploy your Node.js project (with frontend and backend) to Azure App Service, assuming you have already installed Azure CLI and logged in.

## Prerequisites

- Azure CLI installed and logged in (`az login`)
- An Azure subscription
- Your project ready with `package.json` and all dependencies installed
- Backend server listens on the port provided by environment variable `process.env.PORT` or default 3000

## Steps

### 1. Prepare your project for deployment

- Ensure your backend server listens on the port from environment variable:

```js
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
```

- Commit all your changes to git.

### 2. Create an Azure App Service and Resource Group

```bash
az group create --name myResourceGroup --location eastus
az appservice plan create --name myAppServicePlan --resource-group myResourceGroup --sku B1 --is-linux
az webapp create --resource-group myResourceGroup --plan myAppServicePlan --name <your-app-name> --runtime "NODE|18-lts"
```

Replace `<your-app-name>` with a unique name.

### 3. Deploy your code

You can deploy your code using Azure CLI with zip deploy:

```bash
zip -r app.zip .
az webapp deployment source config-zip --resource-group myResourceGroup --name <your-app-name> --src app.zip
```

Alternatively, you can use GitHub Actions or Azure DevOps for CI/CD.

### 4. Configure Application Settings

Set environment variables if needed:

```bash
az webapp config appsettings set --resource-group myResourceGroup --name <your-app-name> --settings NODE_ENV=production
```

### 5. Browse your deployed app

```bash
az webapp browse --resource-group myResourceGroup --name <your-app-name>
```

## Notes

- Make sure your backend serves the frontend static files or use a separate static hosting service.
- Ensure your backend API URLs are correctly configured for production.
- Monitor logs using:

```bash
az webapp log tail --resource-group myResourceGroup --name <your-app-name>
```

## References

- [Azure App Service Documentation](https://learn.microsoft.com/en-us/azure/app-service/)
- [Deploy Node.js app to Azure](https://learn.microsoft.com/en-us/azure/app-service/quickstart-nodejs?tabs=linux)

---

If you want, I can help you create deployment scripts or configure your project for Azure deployment.

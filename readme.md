# taxSun Metagenomic Visualization

The app is available at [https://taxsun-frontend-production.up.railway.app/](https://taxsun-frontend-production.up.railway.app/).

## 📃 Starter Guide

- [How to use](#how-to-use)
- [How to download and run locally](#how-to-download-and-run-locally)
- [How to embed into your project](#how-to-embed-into-your-project)

## How to use

## How to download and run locally

Occasionally, especially if your TSV file contains > 10,000 unique taxIDs, the remote backend might give up on it and fail to load your data. In this case, you can run the program locally and avoid a time-out. Please note that the processing of your file might still need a couple of minutes depending on how diverse your metagenome is.

> [!NOTE]
> This guide assumes that you already have Python and Node.js/npm installed on your machine.

> [!IMPORTANT]
> The NCBI taxonomy database gets regularly updated and is unusable for a couple of hours.

1. Download the code from this repository into a folder called "taxSun-frontend"
2. Download the code from [the backend repository](https://github.com/aralids/taxSun-backend) into a folder called "taxSun-backend"

3. For Windows:
   Open a terminal in the "taxSun-backend" folder and run the following commands: `python install requirements.txt`, `set FLASK_APP=main.py`, `python -m flask run`. It might take a few minutes to load the NCBI taxonomy database, after which the backend will be running at http://localhost:8080.

   For Linux/MacOS:
   Open a terminal in the "taxSun-backend" folder and run the following commands: `python install -r requirements.txt`, `python -m flask --app main.py run`. It might take a few minutes to load the NCBI taxonomy database, after which the backend will be running at http://localhost:8080.

4. Open the file taxSun-frontend/src/App.tsx in a code editor. Change the first line `const baseURL = https://github.com/aralids/taxSun-backend` to `const baseURL = http://localhost:8080`
5. Open a second terminal in the "taxSun-frontend" folder and run the following commands: `npm install`, `npm run build`, `npm run preview`. The frontend will usually be hosted at http://localhost:5173, or on another port if this one is not available. Open it and use taxSun like you would the deployed version.

## How to embed into your project.

taxSun is also available as an npm package that you can install by running `npm install react-taxSun` in the root folder of your React project.

# BlogScraper
A simple Node.js app that scrapes blog posts from a list of websites and sends 5 recommendations to read every day

## Instructions
Here are the installation instructions to set up the Node.js web scraping app on your local machine using Github:

1. Clone the repository by running the following command in your terminal:

    `` git clone https://github.com/yourusername/yourreponame.git``

2. Navigate into the project directory:

    `` cd yourreponame``

3. Install the necessary dependencies by running the following command:

    `` npm install``

4. Create a .env file in the root directory of your application and add the following environment variables:

    `` EMAIL=your@email.com ``

    `` PASSWORD=yourpassword ``

5. Start the server by running the following command:

    `` npm start ``


The server should now be running on ``http://localhost:3000``. You can sign up by making a post request to ``http://localhost:3000/signup`` with a json object containing an email key.


The app will scrape blogs from the websites in the websites array every day, and send 5 unique recommendations to read to each user that signed up.


``Note``: you will also need to have Redis server installed and running on your machine.

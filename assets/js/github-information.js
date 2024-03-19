// Function to generate HTML for user information
function userInformationHTML(user) {
    // Generate HTML for user information using template literals
    return `
        <h2>${user.name}
            <span class="small-name">
                (@<a href="${user.html_url}" target="_blank">${user.login}</a>)
            </span>
        </h2>
        <div class="gh-content">
            <div class="gh-avatar">
                <a href="${user.html_url}" target="_blank">
                    <img src="${user.avatar_url}" width="80" height="80" alt="${user.login}" />
                </a>
            </div>
            <p>Followers: ${user.followers} - Following ${user.following} <br> Repos: ${user.public_repos}</p>
        </div>`;
}

// Function to generate HTML for repository information
function repoInformationHTML(repos) {
    // Check if the repository array is empty
    if (repos.length == 0) {
        // Return message if no repositories found
        return `<div class="clearfix repo-list">No repos!</div>`;
    }

    // Generate HTML for each repository using map function
    var listItemsHTML = repos.map(function(repo) {
        return `<li>
                    <a href="${repo.html_url}" target="_blank">${repo.name}</a>
                </li>`;
    });

    // Combine all repository HTML into one string
    return `<div class="clearfix repo-list">
                <p>
                    <strong>Repo List:</strong>
                </p>
                <ul>
                    ${listItemsHTML.join("\n")}
                </ul>
            </div>`;
}

// Function to fetch GitHub information
function fetchGitHubInformation(event) {
    // Clear existing user and repository data
    $("#gh-user-data").html("");
    $("#gh-repo-data").html("");

    // Get the username from the input field
    var username = $("#gh-username").val();
    // Check if username is empty
    if (!username) {
        // Display message if username is empty
        $("#gh-user-data").html(`<h2 class="gh-error">Please enter a GitHub username</h2>`);
        return;
    }

    // Display loading spinner while fetching data
    $("#gh-user-data").html(
        `<div id="loader">
            <img src="assets/css/loader.gif" alt="loading..." />
        </div>`);

    // Fetch user data and repository data asynchronously using jQuery's $.when().then() syntax
    $.when(
        $.getJSON(`https://api.github.com/users/${username}`),
        $.getJSON(`https://api.github.com/users/${username}/repos`)
    ).then(
        function(firstResponse, secondResponse) {
            // Extract user data and repository data from responses
            var userData = firstResponse[0];
            var repoData = secondResponse[0];
            // Display user information and repository information
            $("#gh-user-data").html(userInformationHTML(userData));
            $("#gh-repo-data").html(repoInformationHTML(repoData));
        },
        function(errorResponse) {
            // Handle errors, such as user not found or API request failure
            if (errorResponse.status === 404) {
                // Display message if user not found
                $("#gh-user-data").html(
                    `<h2 class="gh-error">No info found for user ${username}</h2>`);
            } else if (errorResponse.status === 403) {
                // Display message if rate limit exceeded
                var resetTime = new Date(errorResponse.getResponseHeader('X-RateLimit-Reset') * 1000);
                $("#gh-user-data").html(`<h4 class="gh-error">Too many requests, please wait until ${resetTime.toLocaleTimeString()}</h4>`);
            } else {
                // Log error response and display error message
                console.log(errorResponse);
                $("#gh-user-data").html(
                    `<h2 class="gh-error">Error: ${errorResponse.responseJSON.message}</h2>`);
            }
        });
}

// Execute fetchGitHubInformation function when document is ready
$(document).ready(fetchGitHubInformation);

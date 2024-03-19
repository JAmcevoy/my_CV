// Function to generate HTML for user information
function userInformationHTML(user) {
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
        return `<div class="clearfix repo-list">No repos!</div>`;
    }

    // Generate HTML for each repository
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
        $("#gh-user-data").html(`<h2 class="username-color">Please enter a GitHub username</h2>`);
        return;
    }

    // Display loading spinner
    $("#gh-user-data").html(
        `<div id="loader">
            <img src="assets/css/loader.gif" alt="loading..." />
        </div>`);

    // Call apiToken to fetch token-protected data
    apiToken(username, function(userData, repoData) {
        // Display user and repository data
        $("#gh-user-data").html(userInformationHTML(userData));
        $("#gh-repo-data").html(repoInformationHTML(repoData));
    });
}

// Function to fetch GitHub API token
function apiToken(username, callback) {
    // Personal access token for authentication
    var accessToken = "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";
    // AJAX request to fetch user data
    $.ajax({
        url: `https://api.github.com/users/${username}`,
        headers: {
            "Authorization": "token " + accessToken
        },
        success: function(userData) {
            // Fetch repo data after fetching user data
            $.getJSON(`https://api.github.com/users/${username}/repos`, function(repoData) {
                // Call the callback function with user and repo data
                callback(userData, repoData);
            });
        },
        error: function(xhr) {
            // Handle different types of errors
            if (xhr.status === 404) {
                $("#gh-user-data").html(
                    `<h2>No info found for user ${username}</h2>`);
            } else if (xhr.status === 403) {
                // Get the reset time for rate limit
                var resetTime = new Date(xhr.getResponseHeader('X-RateLimit-Reset') * 1000);
                $("#gh-user-data").html(`<h4>Too many requests, please wait until ${resetTime.toLocaleTimeString()}</h4>`);
            } else {
                // Log other errors to console and display error message
                console.log(xhr);
                $("#gh-user-data").html(
                    `<h2>Error: ${xhr.responseJSON.message}</h2>`);
            }
        }
    });
}

// Execute fetchGitHubInformation function when document is ready
$(document).ready(fetchGitHubInformation);

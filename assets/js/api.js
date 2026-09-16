/**
 * VotSys Centralized API Gateway
 */
const votsysApi = {
  /**
   * Core request wrapper
   */
  request(endpoint, method = "POST", data = null) {
    const baseUrl = sessionStorage.getItem(CONFIG.KEYS.API_URL) || CONFIG.API_BASE_URL;

    return new Promise((resolve, reject) => {
      $.ajax({
        type: method,
        url: baseUrl + endpoint,
        contentType: "application/json",
        dataType: "json",
        beforeSend: function (request) {
          request.setRequestHeader(
            "Access-Control-Allow-Headers",
            "X-Requested-With, content-type"
          );
        },
        data: data ? JSON.stringify(data) : null,
        success: function (result) {
          resolve(result);
        },
        error: function (xhr) {
          let errorObj = { status: "Error", message: "An unexpected error occurred." };
          try {
            if (xhr.responseText) {
              errorObj = $.parseJSON(xhr.responseText);
            }
          } catch (e) {
            errorObj.message = xhr.statusText || "Server connection failed.";
          }
          reject(errorObj);
        }
      });
    });
  },

  // Auth API methods
  voterLogin(username, password) {
    return this.request("/voters/doLogin", "POST", { username, password });
  },

  aspirantLogin(username, password) {
    return this.request("/aspirants/doLogin", "POST", { username, password });
  },

  adminLogin(username, password) {
    // Falls back to aspirant or custom admin login endpoint
    return this.request("/aspirants/doLogin", "POST", { username, password });
  },

  registerVoter(payload) {
    return this.request("/voters/register", "POST", payload);
  },

  registerAspirant(payload) {
    return this.request("/aspirants/register", "POST", payload);
  },

  // Votes & Dashboard API
  getVotes() {
    return this.request("/votes", "GET");
  },

  castVote(payload) {
    return this.request("/votes/cast", "POST", payload);
  }
};

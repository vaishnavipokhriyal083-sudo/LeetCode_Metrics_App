document.addEventListener("DOMContentLoaded", function(){
     
    const searchButton = document.getElementById("search-btn");
    const usernameInput = document.getElementById("user-input");
    const statsContainer = document.querySelector(".stats-container");
    const easyProgressCircle = document.querySelector(".easy-progress");
    const mediumProgressCircle = document.querySelector(".medium-progress");
    const hardProgressCircle = document.querySelector(".hard-progress");
    const easylabel = document.getElementById("easy-label");
    const mediumlabel = document.getElementById("medium-label");
    const hardlabel = document.getElementById("hard-label");
    const cardStatsContainer = document.querySelector(".stats-cards");


    //Return true or fals based on a regex
    //Validate username
    function validateUsername(username){  
      if(username.trim() ==="") {
        alert("Username should not be empty");
        return false;
      }
      const regex = /^[a-zA-Z0-9_-]{1,15}$/;
      const isMatching = regex.test(username);
      if(!isMatching){
        alert("Invalid Username");
        return false;
      }
      return true;
    }

    //Fetch user details

    async function fetchUserDetails(username){
      
      try{
        searchButton.textContent = "Searching...";
        searchButton.disabled = true;

        //const response = await fetch(url);
        const proxyUrl ='https://cors-anywhere.herokuapp.com/'
        const targetUrl = 'https://leetcode.com/graphql/';
        //concatenate url: 
        // https://cors-anywhere.herokuapp.com/https://leetcode.com/graphql/
        const myHeaders = new Headers();
        myHeaders.append("content-type", "application/json");
 
        const graphql = JSON.stringify({
          query: `
          query userSessionProgress($username: String!) {
            allQuestionsCount {
                difficulty
                count
            }

            matchedUser(username: $username) {
                submitStats {
                    acSubmissionNum {
                        difficulty
                        count
                        submissions
                    }
                    totalSubmissionNum {
                        difficulty
                        count
                        submissions
                    }
                }
            }
          }`,

                 variables: { username : username }
        })

       const requestOptions = {
          method: "POST",
          headers: myHeaders,
          body: graphql,
          redirect: "follow"
        };
        console.log("Fetching data for:",username);
    

        const response = await fetch(proxyUrl+targetUrl, requestOptions);
        console.log("Status: ",response.status);

        if(!response.ok){
          throw new Error("Unable to fetch the User details"); 
        }
        const passedData = await response.json();
        console.log("logging data: ", passedData);

        displayUserData(passedData);
      }

      catch(error){
        console.error("Error fetching user details:", error);
        statsContainer.innerHTML = `<p>${error.message}</p>`
      }
      finally{
        searchButton.textContent = "Search";
        searchButton.disabled = false;
      }
    }



    // Update progress circle
    function updateProgress(solved, total, label, circle){
      const progressDegree = (solved / total)*100;
      circle.style.setProperty("--progress-degree",`${progressDegree}%`);
      label.textContent = `${solved}/${total}`;
    }

    // Display User Data

    function displayUserData(passedData){
      console.log("Data received:", passedData);

      // Total questions
      const totalQues = passedData.data.allQuestionsCount[0].count;
      const totalEasyQues = passedData.data.allQuestionsCount[1].count;
      const totalMediumQues = passedData.data.allQuestionsCount[2].count;
      const totalHardQues = passedData.data.allQuestionsCount[3].count;


      // Solved questions
      const solvedTotalQues = passedData.data.matchedUser.submitStats.acSubmissionNum[0].count;
      const solvedTotalEasyQues = passedData.data.matchedUser.submitStats.acSubmissionNum[1].count;
      const solvedTotalMediumQues = passedData.data.matchedUser.submitStats.acSubmissionNum[2].count;
      const solvedTotalHardQues = passedData.data.matchedUser.submitStats.acSubmissionNum[3 ].count;


      // Update circle
      updateProgress(solvedTotalEasyQues, totalEasyQues, easylabel, easyProgressCircle);
      updateProgress(solvedTotalMediumQues, totalMediumQues, mediumlabel, mediumProgressCircle);
      updateProgress(solvedTotalHardQues, totalHardQues, hardlabel, hardProgressCircle);

      // Update Card Data
      const  cardsData = [ 
        {label: "Overall Submissions", value: passedData.data.matchedUser.submitStats.totalSubmissionNum[0].submissions },
        {label: "Overall Easy Submissions", value: passedData.data.matchedUser.submitStats.totalSubmissionNum[1].submissions },
        {label: "Overall Medium Submissions", value: passedData.data.matchedUser.submitStats.totalSubmissionNum[2].submissions },
        {label: "Overall Hard Submissions", value: passedData.data.matchedUser.submitStats.totalSubmissionNum[3].submissions },
      ];

      console.log("Card Data: ", cardsData);

      cardStatsContainer.innerHTML = cardsData.map(
          //for particular data
          data => {
             return `
             <div class= "card">
             <h4>${data.label}</h4>
             <p>${data.value}</p>
             </div>
            `
          }
       ).join("")
      
    }

     searchButton.addEventListener("click",function(){
        const username = usernameInput.value;
        console.log("loggin username: ", username)
        if(validateUsername(username)){
         fetchUserDetails(username); 
        }
      })

})


// listen to when the form is submitted.
document.getElementById("challenge-form").addEventListener("submit",function(e){

    // avoid sending data via GET
    e.preventDefault();

    // clear data in the challenge result section

    // a. clear the info
    document.getElementById("challenge-result-info").innerHTML = "";

    // b. clear the ul 
    document.getElementById("challenge-result-ul").innerHTML = "";

    // get the data sent from the form

    // a. get the winners
    let winners = document.getElementById("week-winners").value;

    // b. get the prizes
    let prizes = document.getElementById("week-prizes").value;

    // check if we have winners data
    if(!winners){
        // show an error
        document.getElementById("week-winners-error").innerHTML = "Winners are required";
    } else {
        // don't show the error
        document.getElementById("week-winners-error").innerHTML = "";
    }

    // check if we have prizes data
    if(!prizes){
        // show an error
        document.getElementById("week-prizes-error").innerHTML = "Prizes are required";
    } else {
        // don't show the error
        document.getElementById("week-prizes-error").innerHTML = "";
    }

    // construct a winners array from the winners string
    winners = winners.split(",").filter(winner => winner);

    // construct a prizes array from the prizes string
    prizes = prizes.split(",").filter(prize => prize).map(prize =>  parseInt(prize));

    // error in case prizes contains a non-numeric
    let prizes_type_error = false;

    // loop through prizes to check if there is a non-numeric
    for(let i = 0; i < prizes.length; i++){

        if(isNaN(prizes[i])){
            // set to error
            prizes_type_error = true;

            // show an error
            document.getElementById("week-prizes-error").innerHTML = "Only numeric prizes";

            // stop iteration
            break;
        }

    }

    // if all prizes are numerics
    if(!prizes_type_error){

        // check if no of prizes is not less than the no of winners
        if(prizes.length < winners.length){

            // show an error
            return document.getElementById("week-prizes-error").innerHTML = "Prizes should not be less than winners";

        }

        // sort the prizes
        prizes = prizes.sort((a,b) => a - b);

        // find the sum of the prizes
        let prizes_sum = prizes.reduce((a,b) => a + b,0);           

        // check if all prizes are equal
        let allEqual = prizes.every(prize => prizes[0] === prize);

        // check if no of prizes can be shared by all winners.
        let prizesIsDivisible = prizes.length % winners.length === 0 ? true : false;

        // check if the sum of prizes can be shared by all winners.
        let prizeSumDivisible = prizes_sum % winners.length === 0 ? true : false;  

        // if prizes are equal
        if(allEqual){

            if(prizesIsDivisible){

                // prizes can be shared by all winners, fair distribution
                return handleFairDistribution(winners,prizes);

            } else {

                // prizes cannnot be shared by all winners, unfair distribution
                return handleUnfairDistribution(winners,prizes);

            }
        }

        // if prizes can be shared by all winners
        else if(prizeSumDivisible){

            if((prizes.length % winners.length) === 0){

                // prizes will be shared, fair distribution
                return handleFairDistribution(winners,prizes);

            } else {

                // prizes will not be shared, unfair distribution
                return handleUnfairDistribution(winners,prizes);

            }

        }

        // prizes cannot be shared by all winners
        else {
            return handleUnfairDistribution(winners,prizes);
        }
        
        
        
           
    }
})

function findFairDistribution(winners,prizes,winner_prize){

    // return result.
    let distro = {};
    
    // iteration through the winners.
    for(let i = 0; i < winners.length; i++ ){

        // initialize the prizes of a particular winner.
        let winner_prizes = [];

        // iteration through the prizes.
        for(let j = 0; j < prizes.length; j++){

            winner_prizes = [];

            // check if the current prize equal to the prize of each winner.
            if(prizes[j] === winner_prize){

                // set it as the winner's prize
                winner_prizes = [prizes[j]];

                // stop iteration
                break;
            } 
            
            // else, initialize the winner's prize with the first prize.
            winner_prizes = [prizes[j]];

            // the initial sum to be the winner's prize also.
            let sum = prizes[j];

            // iterate through all prizes from the first prize
            for(let k = j + 1; k < prizes.length; k++){

                // check if sum is equal to the winner prize 
                if(sum === winner_prize){

                    // stop iteration
                    break;
                }

                // check if sum is greater than winner prize
                if(sum > winner_prize){

                    // set sum to the initial prize
                    sum = prizes[j];

                    // set the winner's prize to the initial prize
                    winner_prizes = [prizes[j]];

                    // proceed to the next jth prize
                    k = j + 2;
                }
                
                // add to the sum the current prize
                sum += prizes[k];

                // push the current prize to the winner's prizes.
                winner_prizes.push(prizes[k]);
            };

            // check if sum is equal to winner prize
            if(sum === winner_prize){

                // remove prizes already added to the winner prizes.
                winner_prizes.forEach(prize => {

                    // get the index
                    let index = prizes.indexOf(prize);

                    // remove the prize from prizes
                    prizes.splice(index,1);

                });         

                // stop the iteration
                break;
            }
        }
        // attach the distribution to the winner
        distro[winners[i]] = winner_prizes;

    };

    // return the distribution object.
    return distro;
};

function findUnfairDistribution(winners,prizes){
    // winners distribution object
    let distro = {};

    // get prizes per winner
    let no_of_prizes_per_winner = prizes.length / winners.length;

    // copy from index
    let copy_from_index = 0;

    // prizes of a winner
    let winner_prizes = [];

    // loop through the winners
    for(let i = 0; i < winners.length; i++){        

        // loop through the prizes
        for(let j = copy_from_index; j < prizes.length; j+=no_of_prizes_per_winner){

            // set the winner's prize
            winner_prizes = prizes.slice(j,j + no_of_prizes_per_winner);

            // increment the copy from index
            copy_from_index += no_of_prizes_per_winner;
            
            // stop the iteration
            break;
        }

        // append the winners prizes
        distro[winners[i]] = winner_prizes;

    };

    // return the distribution object.
    return distro;
};


function handleFairDistribution(winners,prizes){

    // find the sum of the prizes
    let prizes_sum = prizes.reduce((a,b) => a + b,0);

    // get the expected winner prize.
    let winner_prize = prizes_sum / winners.length;

    // get the distribution object
    let final_result = findFairDistribution(winners,prizes,winner_prize);

    // show distribution text
    document.getElementById("challenge-result-info").innerText = "All winners received equal share, fair distribution.";

    // show the distribution pattern
    for(let key of Object.keys(final_result)){
        let li = document.createElement("li");
        let text = document.createTextNode(`${key}: ${final_result[key].join(",")}`);
        li.appendChild(text);
        document.getElementById("challenge-result-ul").append(li);
    }
};

function handleUnfairDistribution(winners,prizes){

    // get the distribution object
    let final_result = findUnfairDistribution(winners,prizes);

    // show distribution text
    document.getElementById("challenge-result-info").innerText = "Winners did not receive equal share, unfair distribution.";
    
    // show the distribution pattern
    for(let key of Object.keys(final_result)){
        let li = document.createElement("li");
        let text = document.createTextNode(`${key} : ${final_result[key].join(",")}`);
        li.appendChild(text);
        document.getElementById("challenge-result-ul").append(li);
    }

};
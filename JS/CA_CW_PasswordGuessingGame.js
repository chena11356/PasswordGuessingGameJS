"use strict";

var locations = ["the Bronx","Brooklyn","Queens","Manhattan","Staten Island","Long Island","Russia","the ancient land of Canada","Scotland","Azerbaijan","India","outer space","Tokyo","Nigeria","Kansas","Ohio","Dallas","Houston","Argentina","Mars","upstate New York","Hogwarts"]
//initialize list of potential locations to choose from
var hackingLoc = ["the Scottish National Petroleum Corporation's database","Mr. Fomin's computer","Pupilpath","Clinton's emails","a TI-84 graphing calculator","Chase Bank","Bank of America","the 2016 US elections","Pokemon Showdown","your favorite ice cream shop's website","your archnemesis' bank account","the Bronx Science website","the Department of Education","the New York State Department of Health","hospital records","the mind of a robotic bear"]
//keep track of stats with global variables
var plays=0
var wins=0
var losses=0
var attemptsToWin=[]
var avgAttempts=0
var medAttempts=0
var attemptsLeft=5
var revealed = [0,0,0,0] //array of revealed digits; if 0, then not revealed, but if 1, then revealed position
//initialize text of popup boxes
var instructionsText = "This is a game in which you try to guess the 4-digit password. You will have 5 chances to guess and many hints. Turn on the sound for maximum enjoyment.<br><br><i>Good luck!</i>"
var statsText = "Number of plays: "+plays+"<br> Number of wins: "+wins+"<br> Number of losses: "+losses+"<br> Average attempts needed to win: "+avgAttempts+"<br> Median attempts needed to win: "+medAttempts+"<br>"
var hintsList=""
var hintsText= "<div id='wrapper'><ul>"+hintsList+"</ul></div>"
var creditsText = "Made by Alex Chen and William Chen of the Bronx High School of Science <br><br>For Computer Science Projects"
var attemptsList = ""
var attemptsText = "Attempts left: "+attemptsLeft+"<br><ol>"+attemptsList+"</ol>"
//initialize blank pw
var pw=""
var hintDex = 0; //initialize index of how many hints given
//initialize pool of hints
var hintsPool=["divisibleBy","repeats","correctPos","sumAll","sumTwo","number","prodTwo","prodAll","quadratic"]
//initialize special cool trivia hints
var hints0=["is the natural log of 1","is the number indices generally start at","looks like an orange","is the second digit of the year the First Crusade start"]
var hints1=["is the 1st digit of the height of the Eiffel Tower in stories","is the natural log of e","is the last digit of the room in which Senate meetings are held"]
var hints2=["is e rounded down","has the most homophones","is the floor on which Epidemiology classes are held"]
var hints3=["is the number of Graeae sisters","is the number of Gorgons","is e rounded up"]
var hints4=["is the number of main intonations in Chinese","is the floor with the Bronx Science swimming pool","an unlucky number for the Chinese"]
var hints5=["is the last digit of the year WWII ended","is the last digit of the guidance offices","is the number of Latin declensions"]
var hints6=["is afraid of 7","is equal to 9/3*2+ln(1)","is the 8th digit of pi"]
var hints7=["is the last digit of the APHUG room","is the staircase across Room 322","is the 4th prime number"]
var hints8=["looks like sideways glasses","is a lucky number for the Chinese","looks like cell mitosis"]
var hints9=["is equal to 3(((0.5x6^2)^0.5)/sqrt(2))","was eaten by 7","is the last digit of the social science research room"]
//initialize list of list of hints
var numHints=[hints0,hints1,hints2,hints3,hints4,hints5,hints6,hints7,hints8,hints9]
//keep track of whether game is finished with global variable
var finished = false;

function scramble(input) { //randomize array while also making sure that no numbers are repeated
	var newArray = []; //initialize new empty array
	var b=input.length; //initialize the input length
	for ( var i=0;i<b;i++) { //repeat process of popping in random value of input array into new array to randomize it all
		var a=randInt(0,input.length) //make random index between 0 and the constantly updated new length of the array (max is excluded)
		newArray.push(input[a]) //add in the correct value to the new array
		input.splice(a,1) //remove the element at the ath index
	};
	return newArray;
}

function median(lst) { //find the median element in an array
	if (lst.length%2==0) { //if even, take the average of the middle two values
		var a=lst[(lst.length)/2];
		var b=lst[((lst.length)/2)-1];
		var res=(a+b)/2;
		res=res.toFixed(1);
		return res;
	} else { //if odd, then just take the middle value
		return lst[(lst.length-1)/2];
	}
}

function randInt(min, max) { //gives random integer between min (inclusive) and max (exclusive)
    return Math.floor(Math.random() * (max - min) ) + min;
}
function playSound(soundfile) { //play a sound with a dummy
  document.getElementById("dummy").innerHTML=
    "<embed src=\""+soundfile+"\" hidden=\"true\" autostart=\"true\" loop=\"false\" />";
}
function intro () { //initialize the introduction paragraph
	var a=locations[randInt(0,locations.length)];
	var b=hackingLoc[randInt(0,hackingLoc.length)];
	var z="You are a hacker from "+a+" trying to hack into "+b+". However, you must solve this password first.";
	document.getElementById('intro').innerHTML=z;
}

function validate() { //analyze user input
	var a=document.game["pw"]; //retrieve the input box
	var b=a.value //temporarily store value of input box
	a.value=""; //clear input box
	document.getElementById('dynamic').innerHTML+="<br>\>\> "+b; //show user input
	
	if (isNaN(b)) { //catch if the input is not a number
		document.getElementById('dynamic').innerHTML+="<br>INVALID INPUT, MUST BE NUMBERS ONLY. ";
		open('#inputBox','_self') //jump to input box (no need to scroll down)
		return false
	};
	if (b.length!=4) { //catch if the user input is longer than 4
		document.getElementById('dynamic').innerHTML+="<br>INVALID INPUT, MUST BE 4 DIGITS LONG. ";
		open('#inputBox','_self') //jump to input box (no need to scroll down)
		return false
	};
	document.getElementById('dynamic').innerHTML+="<br>";
	if (b==pw) { //if the user gets it right, they win
		win()
		open('#inputBox','_self') //jump to input box (no need to scroll down)
		return false
	};
	if (attemptsLeft==1) { //if the user got their last attempt wrong, then they lose
		lose();
		open('#inputbox','_self');
		return false;
	}
	generateHint(b); //if they got past all of that, then generate hint(s)
	if (attemptsLeft==2) { //warn the user if they are on their second to last try
	document.getElementById('dynamic').innerHTML+="<br><span class='redWhite'>WARNING. LAST TRY.</span>"
	}
	attemptsLeft=attemptsLeft-1; //decrement the number of attempts left
	attemptsList+="<li>"+b+"</li>" //add in the user input to the list of attempts
	var d="Attempts left: "+attemptsLeft+"<br><ol>"+attemptsList+"</ol>"
	attemptsText=d; //set attemptsText
	if (document.getElementById('popupName').innerHTML=="Attempts") { //if the popup box is already open on attempts, then set the new attemptsText
		document.getElementById('info').innerHTML=attemptsText
	};
	open('#inputBox','_self') //jump to input box (no need to scroll down)
	
}
function generateHint(guess) { //generate hint(s)
	document.getElementById('dynamic').innerHTML+="INCORRECT. HINT(S): <br/>"
	
	if (attemptsLeft==5) { //determine how many times to generate hints
		var i=1
	} else if (attemptsLeft==4) {
		var i=2
	} else {
		var i=3
	};
	
	var a=""; //initialize hint
	var selection="";
	
	for (var j=0;j<i;j++) {
		selection=hintsPool[hintDex]; //select hint type
		hintDex+=1;
	switch(selection) { //select hint
		case "quadratic":
			a=quadratic(guess);
			break;
		case "divisibleBy":
			a=divisibleBy(guess);
			break;
		case "repeats":
			a=repeats(guess);
			break;
		case "correctPos":
			a=correctPos(guess);
			break;
		case "sumAll":
			a=sumAll(guess);
			break;
		case "sumTwo":
			a=sumTwo(guess);
			break;
		case "number":
			a=number(guess);
			break;
		case "prodAll":
		 a=prodAll(guess);
		 break;
		case "prodTwo":
			a=prodTwo(guess);
			break;
	}
	document.getElementById('dynamic').innerHTML+=a+"<br/>"; //add in the hint to the main game screen
	var f="<li>"+a+"</li>";
	hintsList+=f+"<br>";
	var g="<div id='wrapper'><ul>"+hintsList+"</ul></div>";
	hintsText=g;
	if (document.getElementById('popupName').innerHTML=="Hints") { //if the hints popup box is already open, then update it
		document.getElementById('info').innerHTML=hintsText
	};
}}
	



	function divisibleBy(inp) { //check what number is divisible by
		var prime = 1;
		for (var i = 2; i<100; i++){
			if (parseFloat(pw)%i){prime=0}
		};
		if (prime == 1){return "Password is prime."}; //if the password is a prime number
		var nums=[2,3,5,7,11,13,17,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97]; //a bunch of prime numbers
		var num=nums[randInt(0,nums.length)];
		if (inp%pw==0) {
			return "Input is a multiple of password."
		} else if (pw%inp==0) {
		return "Password is a multiple of input."};
		while (inp%num==0 || pw%num!=0) {//while the input is already divisible by the number OR pw is not
		num=nums[randInt(0,nums.length)]
		};
		var res="Password is divisible by "+num+".";
		return res;
	}
		
	function repeats(inp) { //check how many repeating digits
		inp=inp.split("");
		var temp="";
		var res=false;
		for (var i=0;i<inp.length;i++) {
			if (temp.indexOf(inp[i])!=-1) { //if you can find repeats in the input
				res=true;
				break;
			};
			temp+=inp[i];
		};
		
		var b=pw.split('');
		var temp="";
		var resReal=false;
		for (var i=0;i<b.length;i++) { //if you can find repeats in the real password
			if (temp.indexOf(b[i])!=-1) {
				resReal=true
			};
			temp+=b[i];
		}
		
		if (res&&resReal) { //determine what hint is based on whether or not user is correct
			return "Password does indeed contain a repeating digit."
		} else if (res&&resReal==false) {
			return "Password does not contain a repeating digit."
		} else if (res==false&&resReal) {
			return "Password contains a repeating digit."
		} else if (res==false&&resReal==false) {
			return "Password indeed does not contain a repeating digit."
		}
	}

	function correctPos(inp) { //check how many digits are in correct position by running through and matching
		var correct=0;
		inp=inp.split("");
		var a=pw.split('');
		for (var i=0;i<4;i++) {
			if (inp[i]==a[i]) {
				correct+=1
			};
		}
		return correct+" digit(s) are in the correct position."
	}
	function sumAll(inp) { //sum of all digits
		var sum=0;
		var sumReal=0;
		var a=pw.split('');
		inp=inp.split('');
		for (var i=0;i<4;i++) {
			sumReal+=parseFloat(a[i]); //use parsefloat because it is currently a string, not a number
			sum+=parseFloat(inp[i]);
		};
		if (sum==sumReal) {
			return "The sum of all digits is indeed "+sumReal+"."
		} else {
			return "The sum of all digits is "+sumReal+"."
		}
	}
	function sumTwo(inp) { //sum of two digits, works much like sumAll
		var a=pw.split('');
		inp=inp.split('');
		var num1=randInt(0,4) //num1 and num2 are the two indices, but make sure they are not revealed
		while (revealed[num1] == 1){
		num1=randInt(0,4)};
		var num2=randInt(0,4)
		while (num2==num1) { //make sure num2 is not the same as num1
			num2=randInt(0,4)
		}
		var sumReal=parseFloat(a[num1])+parseFloat(a[num2])
		var sum=parseFloat(inp[num1])+parseFloat(inp[num2])
		if (sum==sumReal) {
			return "The sum of digits in indices "+num1+" and "+num2+" is indeed "+sumReal+"."
		} else {
			return "The sum of digits in indices "+num1+" and "+num2+" is "+sumReal+"."
		}
	}
	function number(inp) { //give hint for specific number
		inp=inp.split('');
		var arr=pw.split('');
		var c=randInt(0,4);
		var correctRev=[0,0,0,0]; //only should give hint about specific digit if it is not yet revealed
		var correct=0;
		for (var i=0;i<4;i++) {
			if (inp[i]==arr[i] || revealed[i] == 1) {
				correctRev[i]=1;
				correct+=1
		}}
		if (correct==4){ //if the user is dumb, then return the following hint
		return "Please read past hints."
		};
		while (inp[c]==arr[c] || revealed[c]==1) {
		c=randInt(0,4)};
		revealed[c]=1;
		var a=arr[c];
		var b="The digit in index "+c+" ";
		b+=numHints[a][randInt(0,numHints[a].length)]+".";
		return b;
	}
	function prodAll(inp) { //prodAll and prodTwo work almost exactly like sumAll and sumTwo, except instead of adding, multiplying
		var sum=1;
		var sumReal=1;
		var a=pw.split('');
		inp=inp.split('');
		for (var i=0;i<4;i++) {
			sumReal=sumReal*parseFloat(a[i]);
			sum=sum*parseFloat(inp[i]);
		};
		if (sum==sumReal) {
			return "The product of all digits is indeed "+sumReal+"."
		} else {
			return "The product of all digits is "+sumReal+"."
		}
	}
	function prodTwo(inp) {
		var a=pw.split('');
		inp=inp.split('');
		var num1=randInt(0,4)
		while (revealed[num1] == 1){
		num1=randInt(0,4)};
		var num2=randInt(0,4)
		while (num2==num1) {
			num2=randInt(0,4)
		}
		var sumReal=parseFloat(a[num1])*parseFloat(a[num2])
		var sum=parseFloat(inp[num1])*parseFloat(inp[num2])
		if (sum==sumReal) {
			return "The product of digits in indices "+num1+" and "+num2+" is indeed "+sumReal+"."
		} else {
			return "The product of digits in indices "+num1+" and "+num2+" is "+sumReal+"."
		}
	}
	function quadratic(inp) { //digit is root of quadratic function
		inp=inp.split('');
		var arr=pw.split('');
		var c=randInt(0,4);
		var correctRev=[0,0,0,0]; //do not reveal if user already knows the digit
		var correct=0;
		for (var i=0;i<4;i++) {
			if (inp[i]==arr[i] || revealed[i] == 1) {
				correctRev[i]=1;
				correct+=1
		}}
		if (correct==4){
		return "Please read past hints."
		};
		while (inp[c]==arr[c] || revealed[c]==1) {
		c=randInt(0,4)};
		
		revealed[c]=1;
		var root1=parseFloat(arr[c]); //the first root is the digit from the real password
		var root2 = randInt(0,10); //the second root is a random digit from 0 to 9
		var sumRoots = root1+root2;
		var prodRoots = root1*root2;
		var equation = "x<sup>2</sup> - " + sumRoots + "x + " + prodRoots; //build quadratic equation with sum and product of generated roots
		var b="The digit in index "+c+" is a root to the equation ";
		b+=equation;
		return b+" = 0."; //equals zero
	}










function openPopup(buttonID) { //open popup box
	document.getElementById('popup').style.visibility="visible"; //make it visible
	document.getElementById('popupName').innerHTML=buttonID //the name of the popup box should be the id of the button
	var a=document.getElementById('info')
	if (buttonID=="Instructions") { //test what the button id is and set the main text body accordingly
	a.innerHTML=instructionsText}
	if (buttonID=="Stats") {
	a.innerHTML=statsText}
	if (buttonID=="Hints") {
	a.innerHTML=hintsText;}
	if (buttonID=="Credits") {
	a.innerHTML=creditsText}
	if (buttonID=="Attempts") {
	a.innerHTML=attemptsText}
}

function hidePopup() { //hide the popup by making it invisible
	document.getElementById('popup').style.visibility="hidden";
}
function initPW() { //initialize the password as a random number between 1000 and 9999
	pw="";
	pw+=randInt(1000,10000);
}

function changeStats() { //change the stats (average, median etc)
	if (attemptsToWin.length!=0) { //sort the array if it is not empty
	attemptsToWin.sort();
	var e=attemptsToWin.length;
	var f=0;
	for (var i=0;i<e;i++) { //sum of attempts to win
		f+=parseFloat(attemptsToWin[i]);
	};
	avgAttempts=(f/e); //divide total by n for average
	avgAttempts=avgAttempts.toFixed(1); //set it to the nearest tenth
	medAttempts=median(attemptsToWin); //set median attempts by using median function
	} //set stats text
	var d="Number of plays: "+plays+"<br> Number of wins: "+wins+"<br> Number of losses: "+losses+"<br> Average attempts needed to win: "+avgAttempts+"<br> Median attempts needed to win: "+medAttempts+"<br>"
	statsText=d;
	if (document.getElementById('popupName').innerHTML=="Stats") { //if stats text is already open, then update it
		document.getElementById('info').innerHTML=statsText
	};
	
}

function win() { //win function
	playSound('Sounds/win.wav');
	document.getElementById('dynamic').innerHTML+="<br>PASSWORD VALIDATED. AGAIN? (Y/N) ";
	wins+=1; //reset everything
	plays+=1;
	attemptsToWin.push(6-attemptsLeft);
	changeStats();
	finished = true; //set the global variable finished to true to change input validation (see runScript(e) in html doc)
	open('#inputBox','_self'); //jump to input box (no need to scroll down)
}
function lose() { //lose function
	playSound('Sounds/lose.wav');
	document.getElementById('dynamic').innerHTML+="<br><span class='red'>LOCKED PERMANENTLY. PASSWORD WAS "+pw+". AGAIN? (Y/N)</span> ";
	losses+=1;
	plays+=1;
	changeStats();
	finished = true;
	open('#inputBox','_self'); //jump to input box (no need to scroll down)
}
function startUp(){ //restart
	hintsPool=scramble(hintsPool); //scramble the pool of hints
	intro(); //make a new intro with a new storyline
	initPW(); //new password
	revealed = [0,0,0,0];
	attemptsLeft=5;
	hintsList="";
	attemptsList="";
	hintDex = 0;
	var g="<div id='wrapper'><ul>"+hintsList+"</ul></div>"; //reset everything and update popup box if necessary
		hintsText=g;
		if (document.getElementById('popupName').innerHTML=="Hints") {
			document.getElementById('info').innerHTML=hintsText
		};
	attemptsText = "Attempts left: "+attemptsLeft+"<br><ol>"+attemptsList+"</ol>"
	if (document.getElementById('popupName').innerHTML=="Attempts") {
		document.getElementById('info').innerHTML=attemptsText;
	};
	}
function validate2() {
	var a=document.game["pw"]; //retrieve the input box
	var b=a.value //temporarily store value of input box
	a.value=""; //clear input box
	document.getElementById('dynamic').innerHTML+="<br>\>\> "+b; //show user input
	b=b.toLowerCase();
	if (b!="y"&&b!="n") { //check if input is y or n
		document.getElementById('dynamic').innerHTML+="<br>INVALID INPUT, MUST BE Y OR N. ";
		open('#inputBox','_self') //jump to input box (no need to scroll down);
		return false;
	}
	if (b=="y") { //if yes, replay
		playSound('Sounds/reset.wav');
		startUp();
		finished=false;
		document.getElementById('dynamic').innerHTML+='<h2>PASSWORD REQUIRED</h2><img src="Images/lock.png" alt="lock" class="lock" onmouseover="playSound("Sounds/metal.mp3");"><br>PLEASE ENTER 4-DIGIT PASSWORD.'
		open('#inputBox','_self') //jump to input box (no need to scroll down);
	} else { //if no, end
		playSound('Sounds/end.wav');
		document.getElementById('dynamic').innerHTML+="<br>THE END. ";
		open('#inputBox','_self') //jump to input box (no need to scroll down);
		document.getElementById('inputBox').className="hidden"; //hide input box
	}
}
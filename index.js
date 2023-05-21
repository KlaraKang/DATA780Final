// EventListener for Page Transition Effecct
window.transitionToPage = function(href) {
    document.querySelector('body').style.opacity = 0
    setTimeout(function() { 
        window.location.href = href
    }, 500)
  }
  
document.addEventListener('DOMContentLoaded', function(event) {
    document.querySelector('body').style.opacity = 1
})
 
// Typewriter Effect
let messageArray1 = ["This country is suffering from perpetual gun violences, mass shootings, and gun suicides. The nation's ongoing debate over gun controls versus gun ownership rights are ugly conflicts that cost so many innocent lives every day. While America should work hard to completely abolish its pervasive gun culture deeply rooted in Colonialism, its strategies for reducing gun deaths must be age, gender, race, and community specific."]
let messageArray2 = ["<br><br> This project is to visualize the U.S. firearm mortality between 2018 and 2021 to uncover causes of gun deaths by age, race, and gender. It is also to visualize the association between U.S. county-poverty rates and firearm mortality, particularly gun homicides & suicides."];
let messageArray = [messageArray1+messageArray2]
let textPosition = 0;
let speed = 50; //in millisecond. lower number = higher speed
typewriter = () => {
  document.querySelector("#message").
  innerHTML = messageArray[0].substring(0, textPosition) +"<span>\u25ae<span>";
  if(textPosition++ != messageArray[0].length)
    setTimeout(typewriter, speed); 
}
window.addEventListener("load", typewriter);



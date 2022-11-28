let bookList;
//elements that are accessed often within the HTML are cached on start,
var bookTable = document.getElementById("myTable");
var detailsDiv = document.getElementById("book_info");
var confirmText = document.getElementById("confirmation_text");
//input fields
var titleField = document.getElementById("book_title");
var authorField = document.getElementById("author");
var publicationField = document.getElementById("publi_date");
//buttons
var searchButton = document.getElementById("search_button");
var addButton = document.createElement('button');
var updateButton = document.createElement('button');
var deleteButton = document.createElement('button');
addButton.innerHTML = "Add";
updateButton.innerHTML = "Update";
deleteButton.innerHTML = "Delete";
addButton.setAttribute("onClick", "addBook();");

getBookList();

//send a get http request to the server to retrieve the book list json file
function getBookList()
{
  var url = "/api/getData";
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() 
  {
    if (this.readyState == 4 && this.status == 200) {
      let strResponse = JSON.parse(this.responseText);
      bookList = strResponse; //cache the returned list
      displayBooks(); //display the list
    }
  };
  xhttp.open("GET", url, true); //initialise the request with its parameters
  xhttp.send(); //send the request
}

//send a put http request to the server to update the book list that is stored
// on the server
function updateBookList()
{
  var url = "/api/updateData";
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    let strResponse = "Error: no response";
    if (this.readyState == 4 && this.status == 200) {
      strResponse = JSON.parse(this.responseText);
    }
  };
  var stringifiedText = JSON.stringify(bookList);
  xhttp.open("PUT", url);
  xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-  8");
  xhttp.send(stringifiedText);
}

//when called creates a row in the main table for each book entry in the list
function displayBooks()
{
  clearTable(bookTable);
  clearBookInfo();
  for(var i=0; i<bookList.books.length; i++) {
    var newRow = bookTable.insertRow(-1);
    newRow.className = "hoverable_Element";
    for (const item in bookList.books[i]) {
      var newCell = newRow.insertCell(-1);
      newCell.innerHTML = bookList.books[i][item];
    }
    newRow.setAttribute("onClick", "displayBook("+ i +");");
  }
}

//creates a new book object from the data that is in the input fields
function addBook()
{
  var title = document.getElementById("book_title").value;
  var author = document.getElementById("author").value;
  var publicationDate= document.getElementById("publi_date").value;
  bookList.books.push(Book(title, author, publicationDate));
  updateBookList();
  displayBooks();
  confirmText.innerHTML = title + " has been successfully uploaded";
}

//updates the book at the current index with the values that are in the input fields
function updateBook(index)
{
  var title = document.getElementById("book_title").value;
  var author = document.getElementById("author").value;
  var publicationDate= document.getElementById("publi_date").value;
  bookList.books[index] = Book(title, author, publicationDate)
  if(searchButton.innerHTML == "Clear") //if the is like this it means that there is a search query is active
  {
    clearBookInfo();
    search();
  }
  else
  {
    displayBooks();
  }
  updateBookList();
  confirmText.innerHTML = title + " has been successfully updated";
}

//remove a book at the specified index in the list, and the update the list stored on the server
function deleteBook(index)
{
  var title = bookList.books[index].title
  bookList.books.splice(index, 1);
  if(searchButton.innerHTML == "Clear") //if the button is like this it means that there is a search query is active
  {
    clearBookInfo();
    search();
  }
  else
  {
    displayBooks();
  }
  updateBookList();
  confirmText.innerHTML = title + " has been successfully deleted";
}

//sets the detail div to be displayed and allows the user to add a new book
function displayBookMenu() 
{
  clearBookInfo();
  detailsDiv.style.display = 'block';
  var cancelButton = document.getElementById("cancel_button");
  detailsDiv.insertBefore(addButton, cancelButton);
  document.getElementById("job_info").innerHTML = "Add book";
  
}

//displays the the book details div and auto fills the input fields
//with the book at the index in the list, and gives the option to update or delete the book
function displayBook(index)
{
  if(searchButton.innerHTML == "Clear") //if the button is like this it means that there is a search query is active
  {
    clearBookInfo();
    searchButton.innerHTML = "Clear";
    searchButton.setAttribute("onClick", "displayBooks();");
  }
  else
    clearBookInfo();
  detailsDiv.style.display = 'block';
  //sets up the details div to display the details required to update and view the data
  var cancelButton = document.getElementById("cancel_button");
  detailsDiv.insertBefore(updateButton, cancelButton);
  detailsDiv.insertBefore(deleteButton, cancelButton); 
  confirmText.innerHTML = bookList.books[index].title + " has been selected";
  updateButton.setAttribute("onClick", "updateBook(" + index + ");");
  deleteButton.setAttribute("onClick", "deleteBook("+ index +");");
  document.getElementById("job_info").innerHTML = "Update book";
  titleField.value = bookList.books[index].title;
  authorField.value = bookList.books[index].author;
  publicationField.value = bookList.books[index].date;
}

//create a new book object so that it can be added to the list
function Book(title, author, publi_date)
{
  const book = {title, author, date: publi_date};
  return book;
}

//searches for all the entries within the list that match the query
//within the search input field and displays the entries that match
function search()
{
  clearTable(bookTable);
  var query = document.getElementById("searchField").value.toLowerCase();
  var searchButton = document.getElementById("search_button");
  searchButton.innerHTML = "Clear";
  searchButton.setAttribute("onClick", "displayBooks();");
  //display all the entries that match the query
  //this is specially set up so that the index of where the matching entry is located in the original list so that it can be properly edited
  for(var i=0; i<bookList.books.length; i++) {
    if(bookList.books[i].title.toLowerCase().includes(query) || bookList.books[i].author.toLowerCase().includes(query))
    {
      var newRow = bookTable.insertRow(-1);
      newRow.className = "hoverable_Element";
      for (const item in bookList.books[i]) 
      {
        var newCell = newRow.insertCell(-1);
        newCell.innerHTML = bookList.books[i][item];
      }
      newRow.setAttribute("onClick", "displayBook("+ i +");");
    }
  }
}

//removes all the rows in the table barring the first row
function clearTable(table)
{
  var tableRows = table.rows;
  size = tableRows.length;
  while(size > 1)
  {
    table.deleteRow(-1);
    size--;
  }
}

//resets the details div to its default state and hides it from view
function clearBookInfo() 
{
  detailsDiv.style.display = 'none';
  titleField.value = "";
  authorField.value = "";
  publicationField.value = "";
  if (detailsDiv.contains(addButton)) //check if the buttons are children of the details div
  {
    detailsDiv.removeChild(addButton);
  }
  else if(detailsDiv.contains(updateButton)) //else if used as both the add and update buttons should only be children exclusive of the other 
//however it is possible for neither to be a child 
  {
    detailsDiv.removeChild(updateButton);
    detailsDiv.removeChild(deleteButton);
  }
  confirmText.innerHTML = "";
    searchButton.innerHTML = "Search";
  searchButton.setAttribute("onClick", "search();");
}

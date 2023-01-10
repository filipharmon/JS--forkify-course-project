import 'core-js/stable'
import 'regenerator-runtime/runtime'
import * as model from './model.js'
import recipeView from './views/recipeView.js'
import searchView from './views/searchView.js'
import resultsView from './views/resultsView.js'
import bookmarksView from './views/bookmarksView.js'
import PaginationView from './views/paginationView.js'
import addRecipeView from './views/addRecipeView.js'
import { MODAL_CLOSE_SEC } from './config.js'

// if (module.hot) {
//   module.hot.accept()
// }

const controlRecipes = async function(){
  try{

    const id = window.location.hash.slice(1)
    if(!id) return;

    recipeView.renderSpinner()

    //0) Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage())
    bookmarksView.update(model.state.bookmarks)

    //1) Loading recipe
    await model.loadRecipe(id);

    //2) Rendering recipe
    recipeView.render(model.state.recipe)
  }
  catch(err){
    recipeView.renderError()
  }
}

const controlAddBookmark = function () {

  //Add or remove bookmark
  if (!model.state.recipe.bookmarked)
    model.addBookmark(model.state.recipe)
  
  else
    model.deleteBookmark(model.state.recipe.id)
  
  //Update recipe view
  recipeView.update(model.state.recipe)

  //Render bookmarks
  bookmarksView.render(model.state.bookmarks)
}

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks)
  recipeView.addHandlerRender(controlRecipes)
  recipeView._addHandlerUpdateServings(controlServings)
  recipeView.addHandlerBookmark(controlAddBookmark)
  searchView.addHandlerSearch(controlSearchResults)
  PaginationView.addHandlerClick(controlPagination)
  addRecipeView.addHandlerUpload(controlAddRecipe)
}

const controlSearchResults = async function () {
  try {

    resultsView.renderSpinner()
    //1) Get search query
    const query = searchView.getQuery()

    if (!query) return;

    //2) Load search results
    await model.loadSearchResults(query)

    //3) Render search results
    resultsView.render(model.getSearchResultsPage())
    
    //4) Render initial pagination buttons
    PaginationView.render(model.state.search)
  }
  catch (err) {
    console.log(err)
  }
};

const controlPagination = function (goToPage) {
  //3) Render new search results
    resultsView.render(model.getSearchResultsPage(goToPage))
    
    //4) Render new pagination buttons
    PaginationView.render(model.state.search)

}

const controlServings = function(newServings){
  //Update recipe servings(in state)

  model.updateServings(newServings)
  // recipeView.render(model.state.recipe)
  recipeView.update(model.state.recipe)
  //Update view
}

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks)
}

const controlAddRecipe = async function (newRecipe) {
  try {

    //Show spinner
    addRecipeView.renderSpinner()
  
    //Upload new recipe data
    await model.uploadRecipe(newRecipe)
    
    //Render recipe
    recipeView.render(model.state.recipe)

    //Success message
    addRecipeView.renderMessage();

    //Render bookmarks view

    bookmarksView.render(model.state.bookmarks)
    
    //Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`)
    
    //Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow()
    }, MODAL_CLOSE_SEC*1000)
  }
  catch (err) {
    console.error(err, 'boom')
    addRecipeView.renderError(err.message)
  }
}
controlSearchResults()
init()


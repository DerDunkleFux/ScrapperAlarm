export default defineNuxtRouteMiddleware((to, from) => {
    const userIdCookie = useCookie("userID")
    const publicRoutes = ["/about", "/login"]
    const isPublicRoute = publicRoutes.includes(to.path)

 console.log("coming from route: ", from.path)

console.log("trying to go to route: ", to.path)

console.log("userCookieID: ", userIdCookie.value)

console.log("Going to public route?: ", isPublicRoute) 
    if (to.path == "/" || (!userIdCookie.value && !isPublicRoute)) {
//  
        console.log("Should navigate to /login")
        // Never navigate to "/" and go to login if no userId Cookie is set and user tries to load a non public route
        return navigateTo("/login")
    }

})
const asyncHandler = (reuestHandler) => {
    (req, res, next) => {
        Promise.resolve(reuestHandler(req,res,next)).
        catch((err) => next(err)) 
    }
}

export default asyncHandler


// const asyncHandler = (fn) => async(req,res,next) => {
//     try{
//         await fn(req,res,next)
//     }catch(err){
//         res.status(err.code || 500).json({
//             success: false,
//             error: err.message
//         })
//     }
// }
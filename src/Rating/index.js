
import "./index.css";

const Rating= (props) => {

    const {itemRatingScore, starWidth}= props.data

    let rating = itemRatingScore || 0;
    const stars =[];

    
    while (stars.length < 5) {
        if (rating > 1) {
            stars.push(1);
        } else if (rating > 0) {
            
         console.log("rating",rating)
            const empty = Math.abs(0 - rating);
            const quart = Math.abs(0.25 - rating);
            const half = Math.abs(0.5 - rating);
            const three = Math.abs(0.75 - rating);
            const full = Math.abs(1 - rating);
            const closest = Math.min(empty, quart, half, three, full);
            switch (closest) {
                case (empty): 
                    stars.push(0);
                    break;
                case quart: 
                    stars.push(0.28);
                    break;
                case half: 
                    stars.push(0.5);
                    break;
                case three: 
                    stars.push(0.72);
                    break;
                case full: 
                    stars.push(1.0);
                    break;
                default: 

                    stars.push(0);
                    break;
            }
        } else {
            stars.push(0);
        }
        rating = rating - 1;
    }
 

    return (
        <div className="star-rating">
            <div className="star-rating-top" >
                {stars.map((item)=>{
                    return( 
                        <div className="star">
                            <div className="star1" style={{width:`${starWidth*item}px`}}></div>
                        </div>
                    )
                })}
            </div>
            <div className="star-rating-bottom">
                {[1,2,3,4,5].map( i =>
                    <img className="star" src="https://gw.alicdn.com/imgextra/i2/O1CN017PJxT81OPjHeWRPek_!!6000000001698-2-tps-32-32.png" alt="" />
                )}
            </div>
        </div>
    );

}

export default Rating;
import React from 'react'
import { useParams } from 'react-router-dom'
import { useState } from 'react'
import axios from 'axios'
import { useEffect } from 'react'
import CastCard from './CastCard'
import VideoCard from './VideoCard'
import MovieCard from './MovieCard'

function DisplayPage() {
    
    const { id } = useParams()
    const [predData, setPredData] = useState([])
    const [predMovies, setPredMovies] = useState([])
    const [content, setContent] = useState([])
    const [cast, setCast] = useState([])
    const [videoData, setVideoData] = useState([])
    const [reviewData,setReviewData]=useState([])
    const [reviewSentimentData,setReviewSentimentData]=useState([])

    const content_url = window.location.pathname.split('/')[1] === 'movie' ? `https://api.themoviedb.org/3/movie/${id}?api_key=8f655507141a5d524fc2024c9f76b6c7&language=en-US` : `https://api.themoviedb.org/3/tv/${id}?api_key=8f655507141a5d524fc2024c9f76b6c7&language=en-US`

    const cast_url = window.location.pathname.split('/')[1] === 'movie' ? `https://api.themoviedb.org/3/movie/${id}/credits?api_key=8f655507141a5d524fc2024c9f76b6c7&language=en-US` : `https://api.themoviedb.org/3/tv/${id}/credits?api_key=8f655507141a5d524fc2024c9f76b6c7&language=en-US`

    const video_url = window.location.pathname.split('/')[1] === 'movie' ? `https://api.themoviedb.org/3/movie/${id}/videos?api_key=8f655507141a5d524fc2024c9f76b6c7&language=en-US` : `https://api.themoviedb.org/3/tv/${id}/videos?api_key=8f655507141a5d524fc2024c9f76b6c7&language=en-US`

    // const url = 'http://localhost:5000/predict'

    const url = 'https://movie-recommender-api.azurewebsites.net/predict'

    const sentimentUrl='https://sentiment-analysis-api-areeb.azurewebsites.net/sentiment'
    // const sentimentUrl='http://127.0.0.1:5000/sentiment'

    const review_url= window.location.pathname.split('/')[1] === 'movie' ? `https://api.themoviedb.org/3/movie/${id}/reviews?api_key=4d9c9de3bdf0d3b6837c49c086e3b190` : `https://api.themoviedb.org/3/tv/${id}/reviews?api_key=4d9c9de3bdf0d3b6837c49c086e3b190`



    useEffect(() => {

        const fetchData = async () => {
            const res = await axios.get(content_url)
            setContent(res.data)
        }
        fetchData()

        const fetchCast = async () => {
            const res = await axios.get(cast_url)
            setCast(res.data.cast)
        }
        fetchCast()

        const fetchVideo = async () => {
            const res = await axios.get(video_url)
            setVideoData(res.data.results)
        }
        fetchVideo()
        
        const fetchReviews = async () => {
            const res = await axios.get(review_url)
            setReviewData(res.data.results)
        }
        fetchReviews()


        const fetchPredData = async () => {
            const res = await axios.post(url, { "id": id })
            var a = res.data.prediction;
            console.log(a);
            a = a.replace(/'/g, '"');
            a = JSON.parse(a);
            setPredData(a)
        }
        fetchPredData()

        setPredMovies([])
    }, [id])

    // console.log(reviewData);
    const castCard = cast.map((item) => {
        return (
            <CastCard
                name={item.name}
                profile={item.profile_path}
                character={item.character}
            />
        )
    })

    const video_data = videoData.slice(0, 5).map((item) => {
        // if (item.name.toLowerCase().includes('trailer') || item.name.toLowerCase().includes('teaser')) {
        return (
            <VideoCard
                type={item.type}
                site={item.site}
                video_key={item.key}
                name={item.name}
                key={item.key}
            />
        )

    })


    useEffect(() => {
      
        const fetchSentiments = () =>{
            reviewData.forEach(async (item) => {
                // console.log(movie_id);
                
                const res = await axios.post(sentimentUrl,{"review" : item.content})

                // console.log(predMovies);
                // const newPredMovies = [...predMovies]; // spreading operator which doesn't mutate the array and returns new array
                // newPredMovies.push(res.data);

                setReviewSentimentData(reviewSentimentData => [...reviewSentimentData,{"review":item.content,"pred":res.data.prediction}])
            })
        }
        fetchSentiments()

        setReviewSentimentData([])
    }, [reviewData])

    console.log(reviewSentimentData);

    const reviews=reviewSentimentData.map((item)=>{
        const cleanText=item.review.replace(/([^a-z0-9 ]+)/gi, '');
        const pred=item.pred===1 ? "Positive" : "Negative"
        return(
            <div className='review-table'>
                <p className='review'>{cleanText.substr(0,500)+"..."}</p>
                <p className='prediction' style={pred==='Negative' ? {"color" :"red"}:{"color":"green"}}>{pred}</p>
            </div>

        )
    })
    useEffect(() => {
      
        const fetchMovies = () =>{
            predData.forEach(async (movie_id) => {
                // console.log(movie_id);
                
                const movieUrl = `https://api.themoviedb.org/3/movie/${movie_id}?api_key=8f655507141a5d524fc2024c9f76b6c7&language=en-US`
                const res = await axios.get(movieUrl)

                // console.log(predMovies);
                // const newPredMovies = [...predMovies]; // spreading operator which doesn't mutate the array and returns new array
                // newPredMovies.push(res.data);

                setPredMovies(prevPredMovies => [...prevPredMovies,res.data])
            })
        }
        fetchMovies()

    }, [predData])

    const recommendedMovieData = predMovies.map((item) => {
        return (
            <MovieCard
                title={item.title ? item.title : item.name}
                poster_path={'https://image.tmdb.org/t/p/original' + item.poster_path}
                backdrop_path={'https://image.tmdb.org/t/p/original' + item.backdrop_path}
                overview={item.overview}
                release_date={item.release_date ? item.release_date : item.first_air_date}
                vote_average={item.vote_average}
                key={item.id}
                media_type={item.release_date ? 'movie' : 'tv'}
                id={item.id}
            />
        )
    })

    return (
        <>
            <div className='display-outer-container'>
                <div className="banner-img-container">
                    <img className='display-banner-img' src={'https://image.tmdb.org/t/p/original' + content.backdrop_path} alt='banner'></img>
                </div>
                <div className='display-inner-container'>
                    <img className='display-poster-img' src={'https://image.tmdb.org/t/p/original' + content.poster_path} alt='poster'></img>
                    <div className='content-details-container'>
                        <h1>{content.title ? content.title : content.name}</h1>
                        <p>{content.tagline}</p>
                        <p>{content.vote_average ? content.vote_average.toFixed(1) : ""}</p>
                        {content.runtime && <p>{content.runtime}&nbsp;mins</p>}
                        <p>Release Date: {content.release_date ? content.release_date : content.first_air_date}</p>
                        <div>
                            <h2>Overview</h2>
                            <p>{content.overview}</p>
                        </div>
                        <h2>Top Cast</h2>
                        <div className='cast-container'>
                            {castCard.splice(0, 5)}
                        </div>
                    </div>
                </div>
            </div>
            <h1 style={{ 'marginLeft': '150px' }}> Videos </h1>
            <div className='videos-container'>
                {video_data}
            </div>
            {window.location.pathname.split('/')[1] === 'movie' && <div className='outer-container'>
                <h2 style={{ 'margin': '30px 50px' }}>Recommended Movies</h2>
                <div className='inner-container'>
                    {recommendedMovieData.splice(0,12)}
                </div>
            </div>}

            <div className='reviews-container'>           
                <h2 style={{ 'fontSize': '27px' ,"margin-bottom" : "20px","marginRight":'10px'}}>Reviews</h2>
                <div className='reviews-inner-container'>{reviews}</div>
            </div>
        </>
    )
}

export default DisplayPage
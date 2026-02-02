import NotFound from "../assets/NotFound.svg"

export default function PageNotFound() {
  return (
    <div>
      <div className='flex justify-center'>

        <img src={NotFound} alt="Page Not found" />

      </div>
    </div>
  )
}

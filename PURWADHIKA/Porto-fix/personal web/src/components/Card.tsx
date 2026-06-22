function Card(props: { imagePath: string; text: string,alt : string }) {
  return (
    <div>
      <img
        src={props.imagePath}
        alt={props.alt}
        className="rounded-4xl h-[100%] w-[450px]"
      />
      <h2>
        {props.text}
      </h2>
    </div>
  );
}

export default Card;

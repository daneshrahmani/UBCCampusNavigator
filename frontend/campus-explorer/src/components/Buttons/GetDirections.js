import Button from 'react-bootstrap/Button';

export default function GetDirections({ pair, states }) {
	return (
		<Button
			variant="outline-primary"
			size="sm"
			onClick={() => states.setDirectionsPair(pair)}
		>
			Directions
		</Button>
	);
}

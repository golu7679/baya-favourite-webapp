import { Card, Group, ActionIcon, Text, Badge, HoverCard } from "@mantine/core";
import {
	IconHeart,
	IconHeartFilled,
	IconPencil,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface QuoteInputType {
	quote: string;
	author: string;
	category: string;
	isFav: boolean;
	markAsFavAction: (event: boolean) => void;
	onEditAction?: () => void;
}

export default ({
	quote,
	author,
	category,
	isFav,
	onEditAction,
	markAsFavAction,
}: QuoteInputType) => {

	const [markedAsFav, setMarkedAsFav,] = useState(isFav)

	useEffect(() => {
		setMarkedAsFav(isFav)
	}, [isFav, quote])

	return (
		<Card withBorder shadow="sm" radius="md" h={200}>
			<Group justify="space-between" mb="xs">
				<Group>
					<Text fw={500} p={0} m={0}>
						{author}
					</Text>
					{markedAsFav ? (
						<IconHeartFilled
							height={20}
							style={{ outline: "blue", borderColor: "blue", color: "#228be6" }}
							onClick={() => {
								setMarkedAsFav(false);
								markAsFavAction(false);
							}}
						/>
					) : (
						<IconHeart
							height={20}
							style={{ outline: "blue", borderColor: "blue", color: "#228be6" }}
							onClick={() => {
								setMarkedAsFav(true);
								markAsFavAction(true);
							}}
						/>
					)}
				</Group>
				<Badge>{category}</Badge>
			</Group>

			<Text mt="sm" c="dimmed" size="sm">
				{quote}
			</Text>

			<Group justify="flex-end" pos={"absolute"} bottom={12} right={20}>
				{typeof onEditAction === "function" ? (
					<>
						<HoverCard shadow="md">
							<HoverCard.Target>
								<ActionIcon
									variant="filled"
									aria-label="Settings"
									onClick={onEditAction}
								>
									<IconPencil
										style={{ width: "70%", height: "70%" }}
										stroke={1.5}
									/>
								</ActionIcon>
							</HoverCard.Target>
							<HoverCard.Dropdown>Edit</HoverCard.Dropdown>
						</HoverCard>
					</>
				) : (
					<></>
				)}
			</Group>
		</Card>
	);
};

import React from 'react';
import { Grid, Card, CardContent, Typography, CardMedia } from '@mui/material';

const CategoryCardView = ({ categories, onEdit }) => {
    return (
        <Grid container spacing={2}>
            {categories.map((category) => (
                <Grid item xs={12} sm={4} md={2} lg={2} key={category.id}>
                    <Card
                        sx={{ 
                            minWidth: 100, 
                            maxWidth: 150, 
                            cursor: 'pointer', 
                            display: 'flex', 
                            flexDirection: 'column' 
                        }}
                        onClick={() => onEdit(category)}
                    >
                        <CardMedia
                            component="img"
                            height="140"
                            image={category.category_image || "https://via.placeholder.com/150"} // Display image or placeholder
                            alt={category.name}
                        />
                        <CardContent sx={{ p: 1, flex: 1 }}>
                            <Typography variant="subtitle2" gutterBottom noWrap>
                                {category.name}
                            </Typography>
                            <Typography
                                variant="caption"
                                color="textSecondary"
                                noWrap
                                sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    display: 'block',
                                    maxWidth: '100%'
                                }}
                            >
                                {category.description}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default CategoryCardView;

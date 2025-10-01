// src/pages/SearchPage.js
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import InternshipCard from "../components/InternshipCard";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const [results, setResults] = useState([]);
  const [appliedInternshipIds, setAppliedInternshipIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) {
      setResults([]);
      setLoading(false);
      return;
    }

    const fetchResultsAndUserData = async () => {
      setLoading(true);
      try {
        const [searchResultsResponse, myInternshipsResponse] =
          await Promise.all([
            axiosInstance.get(`/api/internships/?search=${query}`),
            axiosInstance.get("/api/internships/my-internships/"),
          ]);

        const appliedIds = new Set(
          myInternshipsResponse.data.map((e) => e.internship.id)
        );

        setResults(searchResultsResponse.data);
        setAppliedInternshipIds(appliedIds);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResultsAndUserData();
  }, [query]);

  const handleSuccessfulApply = (appliedId) => {
    setAppliedInternshipIds((prevIds) => new Set(prevIds).add(appliedId));
  };

  return (
    <Container className="my-5">
      <h2>
        Search Results for: <span className="text-primary">"{query}"</span>
      </h2>
      <hr />
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : results.length > 0 ? (
        <Row xs={1} md={2} lg={3} className="g-4">
          {results.map((internship) => (
            <Col key={internship.id}>
              <InternshipCard
                internship={internship}
                isApplied={appliedInternshipIds.has(internship.id)}
                onApplySuccess={handleSuccessfulApply}
              />
            </Col>
          ))}
        </Row>
      ) : (
        <Alert variant="info">
          No internships found matching your search criteria.
        </Alert>
      )}
    </Container>
  );
};

export default SearchPage;

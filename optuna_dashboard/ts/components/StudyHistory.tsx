import React, { FC, useState } from "react"
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  FormControl,
  Switch,
  Typography,
  useTheme,
  IconButton,
} from "@mui/material"
import { GraphParetoFront } from "./GraphParetoFront"
import { GraphHistory } from "./GraphHistory"
import { GraphTimeline } from "./GraphTimeline"
import { GraphIntermediateValues } from "./GraphIntermediateValues"
import Grid2 from "@mui/material/Unstable_Grid2"
import { DataGrid, DataGridColumn } from "./DataGrid"
import { GraphHyperparameterImportance } from "./GraphHyperparameterImportances"
import { UserDefinedPlot } from "./UserDefinedPlot"
import { BestTrialsCard } from "./BestTrialsCard"
import { StudyNote } from "./Note"
import {
  useStudyDetailValue,
  useStudyDirections,
  useStudySummaryValue,
} from "../state"
import FormControlLabel from "@mui/material/FormControlLabel"
import DownloadIcon from "@mui/icons-material/Download"
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile"
import { AtomsArtifactViewer } from "./AtomsArtifactViewer"

export const StudyHistory: FC<{ studyId: number }> = ({ studyId }) => {
  const theme = useTheme()
  const directions = useStudyDirections(studyId)
  const studySummary = useStudySummaryValue(studyId)
  const studyDetail = useStudyDetailValue(studyId)
  const [logScale, setLogScale] = useState<boolean>(false)
  const [includePruned, setIncludePruned] = useState<boolean>(true)

  const handleLogScaleChange = () => {
    setLogScale(!logScale)
  }

  const handleIncludePrunedChange = () => {
    setIncludePruned(!includePruned)
  }

  const userAttrs = studySummary?.user_attrs || studyDetail?.user_attrs || []
  const userAttrColumns: DataGridColumn<Attribute>[] = [
    { field: "key", label: "Key", sortable: true },
    { field: "value", label: "Value", sortable: true },
  ]
  const trials: Trial[] = studyDetail?.trials || []
  return (
    <Box sx={{ display: "flex", width: "100%", flexDirection: "column" }}>
      <FormControl
        component="fieldset"
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-end",
          padding: theme.spacing(2),
        }}
      >
        <FormControlLabel
          control={
            <Switch
              checked={logScale}
              onChange={handleLogScaleChange}
              value="enable"
            />
          }
          label="Log y scale"
        />
        <FormControlLabel
          control={
            <Switch
              checked={
                studyDetail
                  ? studyDetail.has_intermediate_values && includePruned
                  : false
              }
              onChange={handleIncludePrunedChange}
              disabled={!studyDetail?.has_intermediate_values}
              value="enable"
            />
          }
          label="Include PRUNED trials"
        />
      </FormControl>
      {directions !== null && directions.length > 1 ? (
        <Card sx={{ margin: theme.spacing(2) }}>
          <CardContent>
            <GraphParetoFront study={studyDetail} />
          </CardContent>
        </Card>
      ) : null}
      <Card
        sx={{
          margin: theme.spacing(2),
        }}
      >
        <CardContent>
          <GraphHistory
            studies={studyDetail !== null ? [studyDetail] : []}
            includePruned={includePruned}
            logScale={logScale}
          />
        </CardContent>
      </Card>
      <Grid2 container spacing={2} sx={{ padding: theme.spacing(0, 2) }}>
        {studyDetail !== null &&
          studyDetail.plotly_graph_objects.map((go) => (
            <Grid2 xs={6} key={go.id}>
              <Card>
                <CardContent>
                  <UserDefinedPlot graphObject={go} />
                </CardContent>
              </Card>
            </Grid2>
          ))}
        { studyDetail !== null && studyDetail.artifacts.map((a) => {
              const width = "100%"
              const height = "450px"
              const artifactUrl = `/artifacts/${studyDetail.id}/${a.artifact_id}`
              if (a.mimetype.startsWith("image")) {
                // Avoid showing images in this branch.
                /*
                return (
                  <Card
                    key={a.artifact_id}
                    sx={{
                      marginBottom: theme.spacing(2),
                      width: width,
                      margin: theme.spacing(0, 1, 1, 0),
                    }}
                  >
                    <CardMedia
                      component="img"
                      height={height}
                      image={artifactUrl}
                      alt={a.filename}
                    />
                    <CardContent
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        padding: `${theme.spacing(1)} !important`,
                      }}
                    >
                      <Typography
                        sx={{
                          p: theme.spacing(0.5, 0),
                          flexGrow: 1,
                          wordWrap: "break-word",
                          maxWidth: `calc(100% - ${theme.spacing(8)})`,
                        }}
                      >
                        {a.filename}
                      </Typography>
                      <IconButton
                        aria-label="download artifact"
                        size="small"
                        color="inherit"
                        download={a.filename}
                        sx={{ margin: "auto 0" }}
                        href={artifactUrl}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </CardContent>
                  </Card>
                )
                */
                return null
              }
              if (
                a.mimetype === "chemical/x-pdb" ||
                a.mimetype === "chemical/x-mol2" ||
                a.mimetype === "chemical/x-mdl-sdfile" ||
                a.mimetype === "chemical/x-cif"
              ) {
                return (
                  <Grid2 xs={6}>
                  <Card
                    key={a.artifact_id}
                    sx={{
                      marginBottom: theme.spacing(2),
                      display: "flex",
                      flexDirection: "column",
                      width: width,
                      minHeight: "100%",
                      margin: theme.spacing(0, 1, 1, 0),
                    }}
                  >
                    <Box
                      sx={{
                        flexGrow: 1,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <AtomsArtifactViewer
                        artifactId={a.artifact_id}
                        src={artifactUrl}
                        width={"100%"}
                        height={height}
                        rotate={true}
                        filetype={a.filename.split(".").pop()}
                      />
                    </Box>
                    <CardContent
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        padding: `${theme.spacing(1)} !important`,
                      }}
                    >
                      <Typography
                        sx={{
                          p: theme.spacing(0.5, 0),
                          flexGrow: 1,
                          maxWidth: `calc(100% - ${theme.spacing(8)})`,
                        }}
                      >
                        {a.filename}
                      </Typography>
                      <IconButton
                        aria-label="download artifact"
                        size="small"
                        color="inherit"
                        sx={{ margin: "auto 0" }}
                        download={a.filename}
                        href={artifactUrl}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </CardContent>
                  </Card>
                  </Grid2>
                )
              } else {
                return (
                  <Grid2 xs={6}>
                  <Card
                    key={a.artifact_id}
                    sx={{
                      marginBottom: theme.spacing(2),
                      display: "flex",
                      flexDirection: "column",
                      width: width,
                      minHeight: "100%",
                      margin: theme.spacing(0, 1, 1, 0),
                    }}
                  >
                    <Box
                      sx={{
                        flexGrow: 1,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <InsertDriveFileIcon sx={{ fontSize: 80 }} />
                    </Box>
                    <CardContent
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        padding: `${theme.spacing(1)} !important`,
                      }}
                    >
                      <Typography
                        sx={{
                          p: theme.spacing(0.5, 0),
                          flexGrow: 1,
                          maxWidth: `calc(100% - ${theme.spacing(8)})`,
                        }}
                      >
                        {a.filename}
                      </Typography>
                      <IconButton
                        aria-label="download artifact"
                        size="small"
                        color="inherit"
                        sx={{ margin: "auto 0" }}
                        download={a.filename}
                        href={artifactUrl}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </CardContent>
                  </Card>
                  </Grid2>
                )
              }
        })}
        {studyDetail !== null &&
        studyDetail.directions.length == 1 &&
        studyDetail.has_intermediate_values ? (
          <Grid2 xs={6}>
            <GraphIntermediateValues
              trials={trials}
              includePruned={includePruned}
              logScale={logScale}
            />
          </Grid2>
        ) : null}
        <Grid2 xs={6}>
          <GraphHyperparameterImportance
            studyId={studyId}
            study={studyDetail}
            graphHeight="450px"
          />
        </Grid2>
        <Grid2 xs={6}>
          <GraphTimeline study={studyDetail} />
        </Grid2>
        <Grid2 xs={6} spacing={2}>
          <BestTrialsCard studyDetail={studyDetail} />
        </Grid2>
        <Grid2 xs={6}>
          <Card>
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  margin: "1em 0",
                  fontWeight: theme.typography.fontWeightBold,
                }}
              >
                Study User Attributes
              </Typography>
              <DataGrid<Attribute>
                columns={userAttrColumns}
                rows={userAttrs}
                keyField={"key"}
                dense={true}
                initialRowsPerPage={5}
                rowsPerPageOption={[5, 10, { label: "All", value: -1 }]}
              />
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>
      {studyDetail !== null && (
          <Card
            sx={{
              margin: theme.spacing(2),
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  margin: "1em 0",
                  fontWeight: theme.typography.fontWeightBold,
                }}
              >
                Study Note
              </Typography>
              <StudyNote
                studyId={studyId}
                latestNote={studyDetail.note}
                cardSx={{ flexGrow: 1 }}
              />
            </CardContent>
          </Card>
      )}
    </Box>
  )
}
